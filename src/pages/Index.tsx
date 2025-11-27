import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const featuredEvents = [
  {
    title: "Tech Innovation Summit 2024",
    description: "Join industry leaders discussing the future of technology and innovation",
    date: "March 15, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "San Francisco Convention Center",
    category: "Technology",
    attendees: 487,
    maxAttendees: 500,
    price: 299,
  },
  {
    title: "Digital Marketing Workshop",
    description: "Learn the latest digital marketing strategies from experts",
    date: "March 20, 2024",
    time: "2:00 PM - 6:00 PM",
    location: "Online",
    category: "Business",
    attendees: 234,
    maxAttendees: 300,
    price: 0,
  },
  {
    title: "Art & Culture Festival",
    description: "Experience local art, music, and cultural performances",
    date: "April 5, 2024",
    time: "10:00 AM - 8:00 PM",
    location: "Central Park",
    category: "Arts",
    attendees: 1250,
    maxAttendees: 2000,
    price: 25,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation variant="landing" />
      <HeroSection />
      
      <section className="container py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <p className="text-muted-foreground">Discover the most popular events happening now</p>
          </div>
          <Link to="/events">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <EventCard key={index} eventId={`featured-${index}`} {...event} />
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Join thousands of event organizers and attendees on EventSphere
          </p>
          <Link to="/auth">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
