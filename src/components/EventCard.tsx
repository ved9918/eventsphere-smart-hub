import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

interface EventCardProps {
  eventId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees?: number;
  price?: number;
  isRegistered?: boolean;
  onRegister?: () => void;
}

export const EventCard = ({
  eventId,
  title,
  description,
  date,
  time,
  location,
  category,
  attendees,
  maxAttendees = 100,
  price = 0,
  isRegistered = false,
  onRegister,
}: EventCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2">{category}</Badge>
          {price > 0 ? (
            <span className="font-semibold">₹{price}</span>
          ) : (
            <Badge variant="outline">Free</Badge>
          )}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2 flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{attendees} / {maxAttendees} attendees</span>
        </div>
      </CardContent>
      
      <CardFooter className="mt-auto">
        <Button 
          className="w-full" 
          onClick={onRegister}
          disabled={isRegistered}
          variant={isRegistered ? "secondary" : "default"}
        >
          {isRegistered ? "Already Registered" : "Register Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};
