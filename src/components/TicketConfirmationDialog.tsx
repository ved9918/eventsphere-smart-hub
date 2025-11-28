import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TicketQRCode } from "@/components/TicketQRCode";
import { CheckCircle2, Download, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TicketConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventDate: string;
  ticketCode: string;
  ticketCount: number;
  userRole: "attendee" | "host" | "admin";
}

export const TicketConfirmationDialog = ({
  open,
  onOpenChange,
  eventTitle,
  eventDate,
  ticketCode,
  ticketCount,
  userRole,
}: TicketConfirmationDialogProps) => {
  const navigate = useNavigate();

  const qrData = JSON.stringify({
    event: eventTitle,
    ticket: ticketCode,
    date: eventDate,
    tickets: ticketCount,
    verified: true,
  });

  const handleViewDashboard = () => {
    onOpenChange(false);
    navigate(`/dashboard/${userRole}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <DialogTitle>Registration Successful!</DialogTitle>
          </div>
          <DialogDescription>
            Your registration has been confirmed. You can access your ticket anytime from your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <TicketQRCode
            eventTitle={eventTitle}
            ticketCode={ticketCode}
            eventDate={eventDate}
            qrData={qrData}
          />

          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Event:</span>
                <p className="font-medium">{eventTitle}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{new Date(eventDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ticket ID:</span>
                <p className="font-medium">{ticketCode}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tickets:</span>
                <p className="font-medium">{ticketCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              📧 A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleViewDashboard}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            View in Dashboard
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
