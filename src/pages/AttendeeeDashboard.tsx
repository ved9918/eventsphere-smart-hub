import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Download, Star, TrendingUp, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TicketQRCode } from "@/components/TicketQRCode";
import { generateTicketQRData } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { ProfileDropdown } from "@/components/ProfileDropdown";

interface RegisteredEvent {
  id: string;
  ticket_code: string;
  event_id: string;
  ticket_count: number;
  payment_status: string;
  events: {
    title: string;
    date: string;
    location: string;
  };
}

const AttendeeeDashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; email: string; id: string } | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<RegisteredEvent | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setProfile(data);
      fetchRegisteredEvents(data.id);
    }
  };

  const fetchRegisteredEvents = async (profileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          ticket_code,
          event_id,
          ticket_count,
          payment_status,
          events (
            title,
            date,
            location
          )
        `)
        .eq('attendee_id', profileId)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      setRegisteredEvents(data || []);
    } catch (error) {
      console.error('Error fetching registered events:', error);
    } finally {
      setLoading(false);
    }
  };

  const recommendedEvents = [
    {
      title: "AI & Machine Learning Conference",
      date: "March 28, 2024",
      reason: "Based on your Technology interest",
    },
    {
      title: "Startup Pitch Night",
      date: "March 22, 2024",
      reason: "Popular in Business category",
    },
  ];

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
            <Link to="/dashboard/attendee">
              <Button variant="ghost">
                <TrendingUp className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <ProfileDropdown user={user} />
          </div>
        </div>
      </nav>
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Attendee Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'User'}!</p>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="recommendations">
              <TrendingUp className="mr-2 h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Events</CardTitle>
                <CardDescription>Events you've registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your events...</p>
                  </div>
                ) : registeredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No registered events yet. Browse events to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registeredEvents.map((registration) => {
                      const eventDate = new Date(registration.events.date);
                      const isPast = eventDate < new Date();
                      
                      return (
                        <div
                          key={registration.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{registration.events.title}</h3>
                              {isPast ? (
                                <Badge variant="outline">Completed</Badge>
                              ) : (
                                <Badge variant="default">Upcoming</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(registration.events.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <Badge variant={registration.payment_status === 'completed' ? 'default' : 'secondary'}>
                                {registration.payment_status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Ticket ID: {registration.ticket_code} | Seats: {registration.ticket_count}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(registration);
                              setIsTicketDialogOpen(true);
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            View Ticket
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription>Events we think you'll love</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedEvents.map((event) => (
                    <div
                      key={event.title}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {event.date}
                        </div>
                        <p className="text-sm text-primary">{event.reason}</p>
                      </div>
                      <Button>View Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Your Event Ticket</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <TicketQRCode
                eventTitle={selectedTicket.events.title}
                ticketCode={selectedTicket.ticket_code}
                eventDate={new Date(selectedTicket.events.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                qrData={generateTicketQRData(
                  selectedTicket.events.title,
                  selectedTicket.ticket_code,
                  new Date(selectedTicket.events.date).toLocaleDateString()
                )}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AttendeeeDashboard;
