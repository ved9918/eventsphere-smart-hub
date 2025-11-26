import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  variant?: "landing" | "authenticated";
  userRole?: "attendee" | "host" | "admin";
}

export const Navigation = ({ variant = "landing", userRole }: NavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Calendar className="h-6 w-6" />
          <span className="text-xl font-bold">EventSphere</span>
        </Link>

        <div className="flex items-center gap-4">
          {variant === "landing" ? (
            <>
              <Link to="/events">
                <Button variant="ghost">Browse Events</Button>
              </Link>
              <Link to="/auth">
                <Button variant="default">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/events">
                <Button variant="ghost">Events</Button>
              </Link>
              <Link to={`/dashboard/${userRole}`}>
                <Button variant="ghost">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
