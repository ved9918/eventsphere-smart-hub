import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { RegistrationDialog } from "@/components/RegistrationDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { TicketConfirmationDialog } from "@/components/TicketConfirmationDialog";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  max_attendees: number;
  price: number;
  image_url?: string;
  event_type: string;
  team_size: number | null;
}

interface Registration {
  event_id: string;
}

const Events = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"attendee" | "host" | "admin">("attendee");
  const [authLoading, setAuthLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [profileId, setProfileId] = useState<string | null>(null);
  
  // Registration flow state
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationData, setRegistrationData] = useState<{
    ticketCount: number;
    contactNumber: string;
    specialRequest: string;
  } | null>(null);
  const [completedTicketCode, setCompletedTicketCode] = useState("");

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (roles && roles.length > 0) {
      if (roles.some(r => r.role === "admin")) {
        setUserRole("admin");
      } else if (roles.some(r => r.role === "host")) {
        setUserRole("host");
      } else {
        setUserRole("attendee");
      }
    }
    
    // Fetch profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();
    
    if (profile) {
      setProfileId(profile.id);
    }
    
    setAuthLoading(false);
  };

  useEffect(() => {
    if (user && profileId) {
      fetchEvents();
      fetchRegistrations();
    }
  }, [user, profileId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('approval_status', 'approved')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('event_id')
        .eq('attendee_id', profileId);

      if (error) throw error;
      const registeredEventIds = new Set(data?.map(r => r.event_id) || []);
      setRegistrations(registeredEventIds);
    } catch (error: any) {
      console.error("Error fetching registrations:", error);
    }
  };

  const handleRegister = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    setSelectedEvent(event);
    setShowRegistrationDialog(true);
  };

  const handleRegistrationSubmit = (data: {
    ticketCount: number;
    contactNumber: string;
    specialRequest: string;
  }) => {
    setRegistrationData(data);
    setShowRegistrationDialog(false);
    
    // If event is free, skip payment and complete registration
    if (!selectedEvent?.price || selectedEvent.price === 0) {
      completeRegistration("N/A", "FREE_EVENT");
    } else {
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentComplete = (paymentMethod: string, transactionId: string) => {
    setShowPaymentDialog(false);
    completeRegistration(paymentMethod, transactionId);
  };

  const completeRegistration = async (paymentMethod: string, transactionId: string) => {
    if (!profileId || !selectedEvent || !registrationData) {
      toast({
        title: "Error",
        description: "Missing registration information",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: ticketData, error: ticketError } = await supabase
        .rpc('generate_ticket_code');

      if (ticketError) throw ticketError;

      const { error } = await supabase
        .from('registrations')
        .insert({
          event_id: selectedEvent.id,
          attendee_id: profileId,
          ticket_code: ticketData,
          payment_status: selectedEvent.price > 0 ? 'completed' : 'pending',
          contact_number: registrationData.contactNumber,
          ticket_count: registrationData.ticketCount,
          special_request: registrationData.specialRequest || null,
          payment_method: paymentMethod,
          transaction_id: transactionId,
        });

      if (error) throw error;

      setCompletedTicketCode(ticketData);
      setRegistrations(prev => new Set(prev).add(selectedEvent.id));
      setShowConfirmationDialog(true);

      toast({
        title: "Registration Successful!",
        description: "Your ticket has been generated.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="text-xl font-bold">EventSphere</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link to={`/dashboard/${userRole}`}>
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <ProfileDropdown user={user} />
          </div>
        </div>
      </nav>
      
      <div className="bg-gradient-to-b from-background to-muted/20 py-20">
        <div className="container">
          <h1 className="mb-4 text-center text-5xl font-bold">Discover Events</h1>
          <p className="mb-8 text-center text-xl text-muted-foreground">
            Find and register for amazing events happening near you
          </p>
          
          <div className="mx-auto flex max-w-3xl gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="container py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No events found matching your criteria</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                eventId={event.id}
                title={event.title}
                description={event.description}
                date={new Date(event.date).toLocaleDateString()}
                time="TBD"
                location={event.location}
                category={event.category}
                attendees={0}
                maxAttendees={event.max_attendees}
                price={event.price}
                isRegistered={registrations.has(event.id)}
                imageUrl={event.image_url}
                onRegister={userRole === "attendee" ? () => handleRegister(event.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Registration Flow Dialogs */}
      {selectedEvent && (
        <>
          <RegistrationDialog
            open={showRegistrationDialog}
            onOpenChange={setShowRegistrationDialog}
            eventTitle={selectedEvent.title}
            availableSeats={selectedEvent.max_attendees}
            eventType={selectedEvent.event_type}
            teamSize={selectedEvent.team_size}
            onSubmit={handleRegistrationSubmit}
          />

          <PaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            eventTitle={selectedEvent.title}
            amount={selectedEvent.price}
            ticketCount={registrationData?.ticketCount || 1}
            onPaymentComplete={handlePaymentComplete}
          />

          <TicketConfirmationDialog
            open={showConfirmationDialog}
            onOpenChange={setShowConfirmationDialog}
            eventTitle={selectedEvent.title}
            eventDate={selectedEvent.date}
            ticketCode={completedTicketCode}
            ticketCount={registrationData?.ticketCount || 1}
            userRole={userRole}
          />
        </>
      )}
    </div>
  );
};

export default Events;
