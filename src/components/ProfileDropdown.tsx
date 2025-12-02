import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from "./ProfileCard";
import { ProfileSetupDialog } from "./ProfileSetupDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Profile {
  full_name: string;
  email: string;
  role_type?: string;
  area_of_interest?: string;
  preferred_event_type?: string;
  motivation?: string;
  city?: string;
  profile_picture_url?: string;
  profile_completed?: boolean;
}

interface UserRole {
  role: string;
}

export const ProfileDropdown = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserRoles();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    setProfile(data);
    
    // Fetch events count
    if (data) {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('attendee_id', data.id);
      
      setEventsCount(count || 0);
    }
    
    // Show setup dialog if profile is not complete
    if (data && !data.profile_completed) {
      setIsSetupOpen(true);
    }
  };

  const fetchUserRoles = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching roles:', error);
      return;
    }
    
    setRoles(data || []);
  };

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
        title: "Signed out successfully",
      });
      navigate('/auth');
    }
  };

  if (!user || !profile) return null;

  const handleEditClick = () => {
    setIsProfileOpen(false);
    setIsEditMode(true);
    setIsSetupOpen(true);
  };

  const handleSetupComplete = () => {
    fetchUserProfile();
    setIsEditMode(false);
  };

  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.profile_picture_url || ""} alt={profile.full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md flex items-center justify-center">
          <ProfileCard 
            profile={profile} 
            roles={roles.map(r => r.role)}
            eventsCount={eventsCount}
            onEditClick={handleEditClick}
          />
        </DialogContent>
      </Dialog>

      <ProfileSetupDialog
        open={isSetupOpen}
        onOpenChange={setIsSetupOpen}
        userId={user?.id || ""}
        onComplete={handleSetupComplete}
      />
    </>
  );
};
