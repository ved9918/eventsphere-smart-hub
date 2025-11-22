import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Star, TrendingUp } from "lucide-react";

const AttendeeeDashboard = () => {
  const userInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Attendee",
    interests: ["Technology", "Business", "Arts"],
  };

  const registeredEvents = [
    {
      title: "Tech Innovation Summit 2024",
      date: "March 15, 2024",
      status: "Upcoming",
      ticketId: "TKT-001234",
    },
    {
      title: "Digital Marketing Workshop",
      date: "March 20, 2024",
      status: "Upcoming",
      ticketId: "TKT-001235",
    },
  ];

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
      <Navigation variant="authenticated" userRole="attendee" />
      
      <div className="container py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">Attendee Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userInfo.name}!</p>
          </div>
          
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">{userInfo.name}</p>
                <p className="text-muted-foreground">{userInfo.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role: {userInfo.role}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {userInfo.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <div className="space-y-4">
                  {registeredEvents.map((event) => (
                    <div
                      key={event.ticketId}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </span>
                          <Badge variant="outline">{event.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Ticket ID: {event.ticketId}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download Ticket
                      </Button>
                    </div>
                  ))}
                </div>
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
      </div>
    </div>
  );
};

export default AttendeeeDashboard;
