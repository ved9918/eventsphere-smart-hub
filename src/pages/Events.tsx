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
    setAuthLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

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
                title={event.title}
                description={event.description}
                date={new Date(event.date).toLocaleDateString()}
                time="TBD"
                location={event.location}
                category={event.category}
                attendees={0}
                maxAttendees={event.max_attendees}
                price={event.price}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
