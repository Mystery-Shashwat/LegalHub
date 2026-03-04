"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { format } from "date-fns";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, UploadCloud } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadCase = useCallback(async () => {
    try {
      const { data } = await api.get(`/cases/${id}`);
      setCaseData(data.case);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load case details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
          // 1. Get Presigned URL
          const { data: { uploadUrl } } = await api.post("/uploads/presign", {
              fileName: file.name,
              fileType: file.type
          });

          // 2. Upload directly to S3/R2 via Presigned URL
          await fetch(uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type }
          });

          // 3. (Mock) Save document to Case database.
          // Note: Full implementation requires backend route /cases/:id/documents
          toast.success("Document uploaded successfully (Mock DB persistence)");
          // loadCase();

      } catch (error) {
          console.error("Upload error", error);
          toast.error("Failed to upload document");
      } finally {
          setUploading(false);
          // Reset file input
          e.target.value = '';
      }
  };

  if (loading) return <div>Loading case details...</div>;
  if (!caseData) return <div>Case not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-muted-foreground mt-1">
                {user?.role === "CLIENT" 
                    ? `Lawyer: ${caseData.lawyer.user.name}` 
                    : `Client: ${caseData.booking.client.name}`}
            </p>
        </div>
        <Badge variant={caseData.status === "CLOSED" ? "secondary" : "default"} className="text-lg px-4 py-1">
            {caseData.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Case Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{caseData.description || "No description provided."}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Documents</CardTitle>
                    <div>
                        <input 
                            type="file" 
                            id="doc-upload" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('doc-upload')?.click()}
                            disabled={uploading}
                        >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            {uploading ? "Uploading..." : "Upload File"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {caseData.documents?.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No documents have been uploaded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {caseData.documents.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(doc.createdAt), "MMM d, yyyy")} • {(doc.sizeBytes / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Practice Area</p>
                        <p className="font-medium">{caseData.practiceArea}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{format(new Date(caseData.createdAt), "PPP")}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{format(new Date(caseData.updatedAt), "PPP")}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Original Booking</p>
                        <p className="font-medium truncate">{caseData.bookingId}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
