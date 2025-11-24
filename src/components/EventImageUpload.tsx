import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { uploadEventImage } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface EventImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
}

export const EventImageUpload = ({ onImageUploaded, currentImageUrl }: EventImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentImageUrl);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadEventImage(file);
      setPreview(url);
      onImageUploaded(url);
      toast({
        title: "Success",
        description: "Event image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(undefined);
    onImageUploaded("");
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="event-image">Event Banner/Poster</Label>
      {preview ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
          <img src={preview} alt="Event preview" className="w-full h-full object-cover" />
          <Button
            onClick={clearImage}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Input
            id="event-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          <Button type="button" disabled={uploading} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}
    </div>
  );
};
