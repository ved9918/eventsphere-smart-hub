import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  text: string;
  isBot: boolean;
}

const FAQ_RESPONSES: Record<string, string> = {
  "how to register": "To register for an event:\n1. Browse events on the Events page\n2. Click on an event card\n3. Click 'Register Now'\n4. Fill in your details and select number of tickets\n5. Complete payment and you'll receive your ticket!",
  "login issues": "If you're having login issues:\n1. Check your email and password are correct\n2. Use the 'Forgot Password' option if needed\n3. Make sure your account is verified\n4. Try clearing your browser cache\n5. Contact support if the issue persists",
  "create event": "To create an event as a host:\n1. Go to your Host Dashboard\n2. Click 'Create New Event'\n3. Fill in event details (title, date, location, etc.)\n4. Choose Individual or Team event type\n5. Set capacity and pricing\n6. Submit for admin approval\n7. Once approved, your event will be live!",
  "dashboard navigation": "Dashboard Navigation:\n- Attendee Dashboard: View registered events and tickets\n- Host Dashboard: Create and manage your events, view attendees\n- Admin Dashboard: Approve events and view platform analytics\nSwitch between dashboards using the navigation menu.",
  "cancel registration": "To cancel an event registration:\n1. Go to your Attendee Dashboard\n2. Find the event in 'My Registered Events'\n3. Click on the event\n4. Look for cancellation options (if enabled by host)\nNote: Cancellation policies vary by event.",
  "team events": "Team Events:\n- Select 'Team' when creating an event\n- Specify team size (e.g., 2-5 members)\n- During registration, tickets are automatically set to match team size\n- Perfect for tournaments, workshops, or group activities!",
  "payment": "Payment Information:\n- Currently using dummy payment for demo purposes\n- In production, secure payment gateways will be integrated\n- Payment status is shown in your dashboard\n- Tickets are issued immediately after successful payment"
};

const QUICK_OPTIONS = [
  { label: "How to register?", key: "how to register" },
  { label: "Login issues", key: "login issues" },
  { label: "Create an event", key: "create event" },
  { label: "Dashboard help", key: "dashboard navigation" },
  { label: "Cancel registration", key: "cancel registration" },
  { label: "Team events", key: "team events" },
  { label: "Payment info", key: "payment" }
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm here to help. Choose a topic below or type your question:", isBot: true }
  ]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleQuickOption = (key: string, label: string) => {
    if (selectedOptions.includes(key)) return;

    setMessages(prev => [
      ...prev,
      { text: label, isBot: false },
      { text: FAQ_RESPONSES[key], isBot: true }
    ]);
    setSelectedOptions(prev => [...prev, key]);
  };

  const resetChat = () => {
    setMessages([
      { text: "Hi! I'm here to help. Choose a topic below or type your question:", isBot: true }
    ]);
    setSelectedOptions([]);
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Event Platform Help</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetChat}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 whitespace-pre-line",
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Options */}
          <div className="p-4 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Quick topics:</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_OPTIONS.map((option) => (
                <Button
                  key={option.key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickOption(option.key, option.label)}
                  disabled={selectedOptions.includes(option.key)}
                  className="text-xs h-auto py-2"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};