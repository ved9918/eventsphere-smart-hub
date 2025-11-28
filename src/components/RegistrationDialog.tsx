import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  availableSeats: number;
  onSubmit: (data: {
    ticketCount: number;
    contactNumber: string;
    specialRequest: string;
  }) => void;
}

export const RegistrationDialog = ({
  open,
  onOpenChange,
  eventTitle,
  availableSeats,
  onSubmit,
}: RegistrationDialogProps) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [contactNumber, setContactNumber] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (ticketCount < 1 || ticketCount > availableSeats) {
      newErrors.ticketCount = `Please enter a valid number between 1 and ${availableSeats}`;
    }

    if (!contactNumber || !/^[0-9]{10}$/.test(contactNumber)) {
      newErrors.contactNumber = "Please enter a valid 10-digit contact number";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ticketCount,
        contactNumber,
        specialRequest,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>{eventTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tickets">Number of Tickets</Label>
            <Input
              id="tickets"
              type="number"
              min={1}
              max={availableSeats}
              value={ticketCount}
              onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
            />
            {errors.ticketCount && (
              <p className="text-sm text-destructive">{errors.ticketCount}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Available seats: {availableSeats}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number *</Label>
            <Input
              id="contact"
              type="tel"
              placeholder="Enter 10-digit number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
            {errors.contactNumber && (
              <p className="text-sm text-destructive">{errors.contactNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="request">Special Request (Optional)</Label>
            <Textarea
              id="request"
              placeholder="Any special requirements or requests..."
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the Terms & Conditions *
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-destructive">{errors.terms}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Continue to Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
