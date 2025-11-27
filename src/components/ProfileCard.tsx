import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Heart, Calendar, Edit } from "lucide-react";

interface ProfileCardProps {
  profile: {
    full_name: string;
    email: string;
    role_type?: string;
    area_of_interest?: string;
    preferred_event_type?: string;
    motivation?: string;
    city?: string;
    profile_picture_url?: string;
  };
  roles: string[];
  eventsCount?: number;
  onEditClick: () => void;
}

export const ProfileCard = ({ profile, roles, eventsCount = 0, onEditClick }: ProfileCardProps) => {
  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="relative pb-3">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={onEditClick}
        >
          <Edit className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col items-center space-y-4 pt-4">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={profile.profile_picture_url || ""} alt={profile.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {profile.role_type && (
          <div className="flex items-center gap-3 text-sm">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span>{profile.role_type}</span>
          </div>
        )}
        
        {profile.city && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{profile.city}</span>
          </div>
        )}
        
        {profile.motivation && (
          <div className="flex items-center gap-3 text-sm">
            <Heart className="w-4 h-4 text-muted-foreground" />
            <span>{profile.motivation}</span>
          </div>
        )}
        
        {profile.area_of_interest && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Area of Interest</p>
            <Badge variant="outline">{profile.area_of_interest}</Badge>
          </div>
        )}
        
        {profile.preferred_event_type && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Preferred Event Type</p>
            <Badge variant="outline">{profile.preferred_event_type}</Badge>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">{eventsCount}</span>
            <span className="text-muted-foreground">Events Joined</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
