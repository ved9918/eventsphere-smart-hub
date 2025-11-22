import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-events.jpg";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background z-0" />
      
      <div className="container relative z-10 flex min-h-[600px] flex-col items-center justify-center space-y-8 py-20 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Discover & Host
            <span className="block text-primary">Amazing Events</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            EventSphere brings together event organizers and attendees with AI-powered recommendations and seamless registration
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link to="/events">
            <Button size="lg" className="gap-2">
              Browse Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline">
              Create Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 pt-12 sm:grid-cols-3">
          <div className="flex flex-col items-center space-y-2">
            <div className="rounded-full bg-primary/10 p-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy Registration</h3>
            <p className="text-sm text-muted-foreground">Register for events in seconds</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="rounded-full bg-primary/10 p-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Community Driven</h3>
            <p className="text-sm text-muted-foreground">Connect with like-minded people</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="rounded-full bg-primary/10 p-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Smart Recommendations</h3>
            <p className="text-sm text-muted-foreground">AI-powered event suggestions</p>
          </div>
        </div>
      </div>
    </section>
  );
};
