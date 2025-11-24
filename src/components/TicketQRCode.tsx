import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TicketQRCodeProps {
  eventTitle: string;
  ticketCode: string;
  eventDate: string;
  qrData: string;
}

export const TicketQRCode = ({ eventTitle, ticketCode, eventDate, qrData }: TicketQRCodeProps) => {
  const downloadQR = () => {
    const svg = document.getElementById(`qr-${ticketCode}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `ticket-${ticketCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">{eventTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-background p-4 rounded-lg">
          <QRCodeSVG
            id={`qr-${ticketCode}`}
            value={qrData}
            size={200}
            level="H"
            includeMargin
          />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Ticket Code</p>
          <p className="font-mono font-semibold">{ticketCode}</p>
          <p className="text-sm text-muted-foreground">{eventDate}</p>
        </div>
        <Button onClick={downloadQR} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Ticket
        </Button>
      </CardContent>
    </Card>
  );
};
