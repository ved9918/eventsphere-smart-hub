import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventImageUpload } from "@/components/EventImageUpload";
import { Plus, Users, Calendar, Download, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const HostDashboard = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    maxAttendees: "",
    price: "",
    imageUrl: "",
  });

  const handleCreateEvent = () => {
    // TODO: Implement actual event creation with Supabase
    toast({
      title: "Event created",
      description: "Your event has been created successfully",
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
    });
  };

  const userInfo = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Event Host",
    eventsHosted: 12,
  };

  const myEvents = [
    {
      title: "Tech Innovation Summit 2024",
      date: "March 15, 2024",
      attendees: 487,
      maxAttendees: 500,
      status: "Active",
    },
    {
      title: "AI & Machine Learning Conference",
      date: "March 28, 2024",
      attendees: 823,
      maxAttendees: 1000,
      status: "Active",
    },
  ];

  const optimalTimes = [
    {
      event: "Upcoming Workshop",
      suggestedTime: "2:00 PM - 6:00 PM",
      reason: "Based on 87% attendance rate at similar times",
      confidence: "High",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation variant="authenticated" userRole="host" />
      
      <div className="container py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">Host Dashboard</h1>
            <p className="text-muted-foreground">Manage your events, {userInfo.name}!</p>
          </div>
          
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Host Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">{userInfo.name}</p>
                <p className="text-muted-foreground">{userInfo.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role: {userInfo.role}</p>
              </div>
              <div>
                <p className="font-semibold text-primary">{userInfo.eventsHosted} Events Hosted</p>
              </div>
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
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      placeholder="Technology, Business, etc."
                    />
                  </div>
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

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button onClick={handleCreateEvent} className="w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="timing">
              <Clock className="mr-2 h-4 w-4" />
              AI Timing Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
                <CardDescription>Manage and view your hosted events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myEvents.map((event) => (
                    <div
                      key={event.title}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant="secondary">{event.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.attendees} / {event.maxAttendees}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export Attendees
                        </Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  AI-Powered Timing Recommendations
                </CardTitle>
                <CardDescription>Optimize your event scheduling based on historical data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimalTimes.map((suggestion) => (
                    <div
                      key={suggestion.event}
                      className="rounded-lg border bg-muted/50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">{suggestion.event}</h3>
                        <Badge variant={suggestion.confidence === "High" ? "default" : "secondary"}>
                          {suggestion.confidence} Confidence
                        </Badge>
                      </div>
                      <p className="mb-1 text-lg font-medium text-primary">
                        {suggestion.suggestedTime}
                      </p>
                      <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostDashboard;
