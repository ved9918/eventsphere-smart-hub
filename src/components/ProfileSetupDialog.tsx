import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { uploadEventImage } from "@/lib/supabase";

interface ProfileSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onComplete: () => void;
}

const STEPS = [
  {
    id: "role",
    question: "Are you a Student or Working Professional?",
    field: "role_type",
    options: ["Student", "Working Professional", "Freelancer", "Entrepreneur"],
  },
  {
    id: "interest",
    question: "What's your area of interest?",
    field: "area_of_interest",
    options: ["Technology", "Business", "Entertainment", "Sports", "Arts & Culture", "Education"],
  },
  {
    id: "event-type",
    question: "What type of events do you prefer?",
    field: "preferred_event_type",
    options: ["Workshop", "Webinar", "Fest", "Competition", "Networking", "Conference"],
  },
  {
    id: "motivation",
    question: "What motivates you to attend events?",
    field: "motivation",
    options: ["Learning", "Networking", "Entertainment", "Career Growth", "Community", "Personal Development"],
  },
  {
    id: "city",
    question: "Which city are you from?",
    field: "city",
    type: "input",
  },
  {
    id: "picture",
    question: "Upload your profile picture (optional)",
    field: "profile_picture_url",
    type: "upload",
  },
];

export const ProfileSetupDialog = ({ open, onOpenChange, userId, onComplete }: ProfileSetupDialogProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const currentStepData = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleSelect = (value: string) => {
    setFormData({ ...formData, [currentStepData.field]: value });
  };

  const handleInputChange = (value: string) => {
    setFormData({ ...formData, [currentStepData.field]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadEventImage(file);
      setFormData({ ...formData, profile_picture_url: url });
      setPreview(url);
      toast({
        title: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (currentStepData.type !== "upload" && !formData[currentStepData.field]) {
      toast({
        title: "Please make a selection",
        variant: "destructive",
      });
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          profile_completed: true,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Profile setup complete!",
        description: "Your profile has been successfully created.",
      });
      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Your Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <div className="flex gap-1">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    idx <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="min-h-[300px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{currentStepData.question}</h3>

            {currentStepData.type === "input" ? (
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter your city"
                  value={formData[currentStepData.field] || ""}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              </div>
            ) : currentStepData.type === "upload" ? (
              <div className="space-y-4">
                {preview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={preview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPreview("");
                        setFormData({ ...formData, profile_picture_url: "" });
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <Label htmlFor="profile-pic" className="cursor-pointer">
                      <Button variant="outline" disabled={uploading} asChild>
                        <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                      </Button>
                    </Label>
                    <Input
                      id="profile-pic"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentStepData.options?.map((option) => (
                  <Button
                    key={option}
                    variant={formData[currentStepData.field] === option ? "default" : "outline"}
                    className="h-auto py-4 px-4 text-left justify-start"
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {isLastStep ? (
              <Button onClick={handleFinish}>
                Finish
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
