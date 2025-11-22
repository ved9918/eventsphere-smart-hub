import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "12,543",
      change: "+12.5%",
      icon: Users,
    },
    {
      title: "Active Events",
      value: "287",
      change: "+8.2%",
      icon: Calendar,
    },
    {
      title: "Total Revenue",
      value: "$542,891",
      change: "+23.1%",
      icon: DollarSign,
    },
    {
      title: "Growth Rate",
      value: "94.7%",
      change: "+4.3%",
      icon: TrendingUp,
    },
  ];

  const recentEvents = [
    { name: "Tech Innovation Summit 2024", host: "Sarah Johnson", status: "Approved", attendees: 487 },
    { name: "Digital Marketing Workshop", host: "Mike Chen", status: "Approved", attendees: 234 },
    { name: "Art & Culture Festival", host: "Emma Wilson", status: "Pending", attendees: 1250 },
  ];

  return (
    <div className="min-h-screen">
      <Navigation variant="authenticated" userRole="admin" />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-primary">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest event submissions requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.name}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <h3 className="font-semibold">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">Host: {event.host}</p>
                      <p className="text-sm text-muted-foreground">{event.attendees} registered</p>
                    </div>
                    <Badge variant={event.status === "Approved" ? "secondary" : "outline"}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Feedback Themes</CardTitle>
              <CardDescription>AI-analyzed user feedback summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">User Experience</h3>
                  <Badge>Positive</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Users love the intuitive interface and easy registration process
                </p>
              </div>
              
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Event Discovery</h3>
                  <Badge variant="secondary">Suggestion</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Requests for more filtering options and advanced search
                </p>
              </div>
              
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Mobile Experience</h3>
                  <Badge>Positive</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mobile responsiveness praised across all devices
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
