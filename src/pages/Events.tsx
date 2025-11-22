import { Navigation } from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const allEvents = [
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
  {
    title: "Startup Pitch Night",
    description: "Watch innovative startups pitch their ideas to investors",
    date: "March 22, 2024",
    time: "6:00 PM - 9:00 PM",
    location: "Innovation Hub",
    category: "Business",
    attendees: 145,
    maxAttendees: 200,
    price: 15,
  },
  {
    title: "Photography Masterclass",
    description: "Learn professional photography techniques from award-winning photographers",
    date: "April 1, 2024",
    time: "1:00 PM - 5:00 PM",
    location: "Creative Studio Downtown",
    category: "Arts",
    attendees: 67,
    maxAttendees: 80,
    price: 89,
  },
  {
    title: "AI & Machine Learning Conference",
    description: "Explore the latest advancements in AI and machine learning technology",
    date: "March 28, 2024",
    time: "8:00 AM - 6:00 PM",
    location: "Tech Plaza",
    category: "Technology",
    attendees: 823,
    maxAttendees: 1000,
    price: 399,
  },
];

const Events = () => {
  return (
    <div className="min-h-screen">
      <Navigation variant="landing" />
      
      <section className="border-b bg-muted/30 py-8">
        <div className="container">
          <h1 className="mb-6 text-4xl font-bold">Browse Events</h1>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                className="pl-10"
              />
            </div>
            
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">{allEvents.length} events found</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Events;
