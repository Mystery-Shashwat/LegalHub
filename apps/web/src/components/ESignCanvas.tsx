import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { PenTool } from "lucide-react";

interface ESignCanvasProps {
  documentId: string;
  documentName: string;
  onSuccess: () => void;
}

export default function ESignCanvas({ documentId, documentName, onSuccess }: ESignCanvasProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Please provide a signature before saving.");
      return;
    }

    setLoading(true);
    const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      await api.post("/signatures", {
        documentId,
        signatureDataUrl,
      });
      toast.success("Document successfully signed!");
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Signature Error:", error);
      toast.error("Failed to sign the document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <PenTool className="w-4 h-4 mr-2" />
          Sign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>E-Sign Document</DialogTitle>
          <DialogDescription>
            You are signing <strong>{documentName}</strong>. Draw your signature below.
          </DialogDescription>
        </DialogHeader>

        <div className="border border-input rounded-md overflow-hidden bg-white/50 backdrop-blur-sm">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              className: "w-full h-48 cursor-crosshair",
            }}
          />
        </div>

        <DialogFooter className="flex sm:justify-between items-center mt-4">
          <Button variant="outline" onClick={handleClear} disabled={loading}>
            Clear
          </Button>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={loading}>
              {loading ? "Signing..." : "Apply Signature"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
