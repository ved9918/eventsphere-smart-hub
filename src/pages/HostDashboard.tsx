import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventImageUpload } from "@/components/EventImageUpload";
import { Plus, Users, Calendar, Download, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Ticket, DollarSign, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TicketQRCode } from "@/components/TicketQRCode";
import { generateTicketQRData } from "@/lib/supabase";

interface HostEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  max_attendees: number;
  price: number;
  approval_status: string;
  status: string;
  registration_deadline: string | null;
  max_tickets_per_user: number;
  allow_cancellation: boolean;
  event_type: string;
  team_size: number | null;
  registrations: Array<{
    id: string;
    ticket_code: string;
    ticket_count: number;
    payment_status: string;
    contact_number: string;
    profiles: {
      full_name: string;
      email: string;
    } | null;
  }>;
}

interface Stats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalTickets: number;
}

const HostDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ id: string; full_name: string; email: string } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, activeEvents: 0, totalRegistrations: 0, totalTickets: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<HostEvent | null>(null);
  const [showAttendeesDialog, setShowAttendeesDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<any>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    maxAttendees: "",
    price: "",
    imageUrl: "",
    registrationDeadline: "",
    maxTicketsPerUser: "1",
    allowCancellation: false,
    eventType: "individual",
    teamSize: "",
  });

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
      fetchHostEvents(data.id);
    }
  };

  const fetchHostEvents = async (profileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          location,
          max_attendees,
          price,
          approval_status,
          status,
          registration_deadline,
          max_tickets_per_user,
          allow_cancellation,
          event_type,
          team_size,
          registrations (
            id,
            ticket_code,
            ticket_count,
            payment_status,
            contact_number,
            profiles (
              full_name,
              email
            )
          )
        `)
        .eq('host_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data || []);
      
      // Calculate stats
      const totalEvents = data?.length || 0;
      const activeEvents = data?.filter(e => 
        e.status === 'active' && 
        new Date(e.date) > new Date() &&
        e.approval_status === 'approved'
      ).length || 0;
      const totalRegistrations = data?.reduce((sum, e) => sum + (e.registrations?.length || 0), 0) || 0;
      const totalTickets = data?.reduce((sum, e) => 
        sum + (e.registrations?.reduce((tSum, r) => tSum + r.ticket_count, 0) || 0), 0
      ) || 0;

      setStats({ totalEvents, activeEvents, totalRegistrations, totalTickets });
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

  const handleCreateEvent = async () => {
    try {
      if (!profile) throw new Error("Profile not found");

      const { error } = await supabase.from('events').insert({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        category: newEvent.category,
        max_attendees: parseInt(newEvent.maxAttendees),
        price: parseFloat(newEvent.price),
        image_url: newEvent.imageUrl,
        host_id: profile.id,
        approval_status: 'pending',
        registration_deadline: newEvent.registrationDeadline || null,
        max_tickets_per_user: parseInt(newEvent.maxTicketsPerUser),
        allow_cancellation: newEvent.allowCancellation,
        event_type: newEvent.eventType,
        team_size: newEvent.eventType === 'team' ? parseInt(newEvent.teamSize) : null,
      });

      if (error) throw error;

      toast({
        title: "Event submitted",
        description: "Your event has been submitted for admin approval",
      });
      setIsCreateDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        maxAttendees: "",
        price: "",
        imageUrl: "",
        registrationDeadline: "",
        maxTicketsPerUser: "1",
        allowCancellation: false,
        eventType: "individual",
        teamSize: "",
      });
      if (profile) fetchHostEvents(profile.id);
    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportAttendees = (event: HostEvent) => {
    if (!event.registrations || event.registrations.length === 0) {
      toast({
        title: "No attendees",
        description: "This event has no registered attendees yet",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Seats', 'Payment Status', 'Contact Number', 'Ticket Code'].join(','),
      ...event.registrations.map(reg => [
        reg.profiles?.full_name || 'Unknown',
        reg.profiles?.email || 'N/A',
        reg.ticket_count,
        reg.payment_status,
        reg.contact_number || 'N/A',
        reg.ticket_code
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}_attendees.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Attendee list has been downloaded",
    });
  };

  const updateEventSettings = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: selectedEvent.status,
          registration_deadline: selectedEvent.registration_deadline,
          max_tickets_per_user: selectedEvent.max_tickets_per_user,
          allow_cancellation: selectedEvent.allow_cancellation,
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Event settings have been updated successfully",
      });
      setShowSettingsDialog(false);
      if (profile) fetchHostEvents(profile.id);
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending Approval</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventStatus = (event: HostEvent) => {
    const isPast = new Date(event.date) < new Date();
    const registrationCount = event.registrations?.length || 0;
    const isFull = registrationCount >= event.max_attendees;

    if (isPast) return { label: 'Completed', variant: 'outline' as const };
    if (event.status === 'active' && event.approval_status === 'approved') {
      if (isFull) return { label: 'Event Full', variant: 'destructive' as const };
      return { label: 'Upcoming', variant: 'default' as const };
    }
    return { label: 'Inactive', variant: 'secondary' as const };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
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
            <Link to="/dashboard/host">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <ProfileDropdown user={user} />
          </div>
        </div>
      </nav>
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground">Manage your events, {profile?.full_name || 'User'}!</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active/Upcoming</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex gap-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Fill in the details to create a new event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Tech Innovation Summit 2024"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={4}
                  />
                </div>

                <EventImageUpload
                  onImageUploaded={(url) => setNewEvent({ ...newEvent, imageUrl: url })}
                  currentImageUrl={newEvent.imageUrl}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={newEvent.registrationDeadline}
                      onChange={(e) => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      placeholder="Technology, Business, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Convention Center, City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={newEvent.maxAttendees}
                      onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTicketsPerUser">Max Tickets/User</Label>
                    <Input
                      id="maxTicketsPerUser"
                      type="number"
                      value={newEvent.maxTicketsPerUser}
                      onChange={(e) => setNewEvent({ ...newEvent, maxTicketsPerUser: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowCancellation"
                    checked={newEvent.allowCancellation}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, allowCancellation: checked })}
                  />
                  <Label htmlFor="allowCancellation">Allow attendees to cancel registration</Label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select
                      value={newEvent.eventType}
                      onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value, teamSize: value === 'individual' ? "" : newEvent.teamSize })}
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newEvent.eventType === 'team' && (
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        min="2"
                        value={newEvent.teamSize}
                        onChange={(e) => setNewEvent({ ...newEvent, teamSize: e.target.value })}
                        placeholder="e.g., 5"
                      />
                      <p className="text-sm text-muted-foreground">
                        Number of members per team (will auto-fill ticket count during registration)
                      </p>
                    </div>
                  )}
                </div>

                <Button onClick={handleCreateEvent} className="w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>Manage and view your hosted events</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events yet. Create your first event to get started!
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event) => {
                  const registrationCount = event.registrations?.length || 0;
                  const ticketsSold = event.registrations?.reduce((sum, r) => sum + r.ticket_count, 0) || 0;
                  const remainingSeats = event.max_attendees - registrationCount;
                  const eventStatus = getEventStatus(event);

                  return (
                    <div key={event.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            {getApprovalStatusBadge(event.approval_status)}
                            <Badge variant={eventStatus.variant}>{eventStatus.label}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {registrationCount} / {event.max_attendees} registered
                            </span>
                            {event.price > 0 && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ₹{event.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Registration Insights */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Live Registration</p>
                          <p className="text-2xl font-bold">{registrationCount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Remaining Seats</p>
                          <p className={`text-2xl font-bold ${remainingSeats === 0 ? 'text-destructive' : ''}`}>
                            {remainingSeats}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Tickets Sold</p>
                          <p className="text-2xl font-bold">{ticketsSold}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-2xl font-bold">₹{(ticketsSold * event.price).toFixed(2)}</p>
                        </div>
                      </div>

                      {remainingSeats === 0 && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                          <AlertCircle className="h-4 w-4" />
                          Event is full
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowAttendeesDialog(true);
                          }}
                          disabled={registrationCount === 0}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Attendees ({registrationCount})
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => exportAttendees(event)}
                          disabled={registrationCount === 0}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (event.registrations && event.registrations.length > 0) {
                              setPreviewTicket({
                                eventTitle: event.title,
                                ticketCode: event.registrations[0].ticket_code,
                                eventDate: new Date(event.date).toLocaleDateString()
                              });
                              setShowTicketPreview(true);
                            }
                          }}
                          disabled={registrationCount === 0}
                        >
                          <Ticket className="mr-2 h-4 w-4" />
                          Preview Ticket
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowSettingsDialog(true);
                          }}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendees Dialog */}
      <Dialog open={showAttendeesDialog} onOpenChange={setShowAttendeesDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registered Attendees</DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEvent?.registrations?.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="font-medium">{reg.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{reg.profiles?.email || 'N/A'}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Seats: {reg.ticket_count}</span>
                    <span>•</span>
                    <span>Ticket: {reg.ticket_code}</span>
                    {reg.contact_number && (
                      <>
                        <span>•</span>
                        <span>Contact: {reg.contact_number}</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant={reg.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {reg.payment_status}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Settings</DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Event</Label>
                  <p className="text-sm text-muted-foreground">Allow new registrations</p>
                </div>
                <Switch
                  checked={selectedEvent.status === 'active'}
                  onCheckedChange={(checked) => 
                    setSelectedEvent({ ...selectedEvent, status: checked ? 'active' : 'inactive' })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="editDeadline">Registration Deadline</Label>
                <Input
                  id="editDeadline"
                  type="datetime-local"
                  value={selectedEvent.registration_deadline || ''}
                  onChange={(e) => 
                    setSelectedEvent({ ...selectedEvent, registration_deadline: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editMaxTickets">Max Tickets Per User</Label>
                <Input
                  id="editMaxTickets"
                  type="number"
                  value={selectedEvent.max_tickets_per_user}
                  onChange={(e) => 
                    setSelectedEvent({ ...selectedEvent, max_tickets_per_user: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editCancellation"
                  checked={selectedEvent.allow_cancellation}
                  onCheckedChange={(checked) => 
                    setSelectedEvent({ ...selectedEvent, allow_cancellation: checked })
                  }
                />
                <Label htmlFor="editCancellation">Allow registration cancellation by attendees</Label>
              </div>

              <Button onClick={updateEventSettings} className="w-full">
                Save Settings
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket Preview Dialog */}
      <Dialog open={showTicketPreview} onOpenChange={setShowTicketPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket Preview</DialogTitle>
          </DialogHeader>
          {previewTicket && (
            <TicketQRCode
              eventTitle={previewTicket.eventTitle}
              ticketCode={previewTicket.ticketCode}
              eventDate={previewTicket.eventDate}
              qrData={generateTicketQRData(
                previewTicket.eventTitle,
                previewTicket.ticketCode,
                previewTicket.eventDate
              )}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostDashboard;
