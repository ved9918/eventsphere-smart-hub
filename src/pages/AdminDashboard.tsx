import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PendingEvent {
  id: string;
  title: string;
  host_id: string;
  date: string;
  approval_status: string;
  profiles?: {
    full_name: string;
  };
}

interface Analytics {
  total_users: number;
  approved_events: number;
  pending_events: number;
  total_registrations: number;
  active_attendees: number;
  total_revenue: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_admin_analytics');

      if (analyticsError) throw analyticsError;
      if (analyticsData && analyticsData.length > 0) {
        setAnalytics(analyticsData[0]);
      }

      // Fetch pending events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          host_id,
          date,
          approval_status,
          profiles!events_host_id_fkey (
            full_name
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setPendingEvents(eventsData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (eventId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ approval_status: approved ? 'approved' : 'rejected' })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: approved ? "Event approved" : "Event rejected",
        description: `Event has been ${approved ? 'approved' : 'rejected'} successfully`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = analytics ? [
    {
      title: "Total Users",
      value: analytics.total_users.toString(),
      change: "+12.5%",
      icon: Users,
    },
    {
      title: "Approved Events",
      value: analytics.approved_events.toString(),
      change: "+8.2%",
      icon: Calendar,
    },
    {
      title: "Total Revenue",
      value: `₹${analytics.total_revenue.toLocaleString()}`,
      change: "+23.1%",
      icon: DollarSign,
    },
    {
      title: "Active Attendees",
      value: analytics.active_attendees.toString(),
      change: "+4.3%",
      icon: TrendingUp,
    },
  ] : [];

  const eventStatusData = analytics ? [
    { name: 'Approved', value: analytics.approved_events, color: '#10b981' },
    { name: 'Pending', value: analytics.pending_events, color: '#f59e0b' },
  ] : [];

  const registrationData = analytics ? [
    { name: 'Total Registrations', value: analytics.total_registrations },
    { name: 'Active Attendees', value: analytics.active_attendees },
  ] : [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <Link to="/dashboard/admin">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <ProfileDropdown user={user} />
          </div>
        </div>
      </nav>
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management, {profile?.full_name || 'Admin'}!</p>
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

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Status Distribution</CardTitle>
              <CardDescription>Overview of event approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={eventStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Registration and attendance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Event Approvals</CardTitle>
            <CardDescription>Events awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending events for approval
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Host: {event.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproval(event.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproval(event.id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
