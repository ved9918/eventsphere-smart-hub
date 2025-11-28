import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, Building, Banknote, CheckCircle2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  amount: number;
  ticketCount: number;
  onPaymentComplete: (paymentMethod: string, transactionId: string) => void;
}

export const PaymentDialog = ({
  open,
  onOpenChange,
  eventTitle,
  amount,
  ticketCount,
  onPaymentComplete,
}: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const totalAmount = amount * ticketCount;

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Generate dummy transaction ID
      const transactionId = `DUMMY_${Date.now()}`;
      
      // Wait a moment to show success, then complete
      setTimeout(() => {
        onPaymentComplete(paymentMethod, transactionId);
      }, 1500);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!paymentSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
              <DialogDescription>{eventTitle}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Tickets ({ticketCount})
                  </span>
                  <span className="font-medium">₹{amount} × {ticketCount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold">₹{totalAmount}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5" />
                      <span>UPI</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5" />
                      <span>Debit/Credit Card</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building className="h-5 w-5" />
                      <span>Net Banking</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5" />
                      <span>Cash on Arrival</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Proceed to Pay"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment of ₹{totalAmount} has been processed successfully.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
