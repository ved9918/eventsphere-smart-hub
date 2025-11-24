import { supabase } from "@/integrations/supabase/client";

export const uploadEventImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('event-images')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('event-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const generateTicketQRData = (eventTitle: string, ticketCode: string, eventDate: string): string => {
  return JSON.stringify({
    event: eventTitle,
    ticket: ticketCode,
    date: eventDate,
    verified: true
  });
};
