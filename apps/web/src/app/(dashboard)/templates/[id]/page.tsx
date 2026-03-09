"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { format } from "date-fns";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Download, ShoppingCart, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  downloads: number;
  createdAt: string;
}

export default function TemplateDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Check if user already owns it (basic check, backend enforces security)
  const [hasPurchased, setHasPurchased] = useState(false);

  const fetchTemplate = useCallback(async () => {
    try {
      const { data } = await api.get(`/templates/${id}`);
      setTemplate(data.template);
      
      // If user is client, fetch their purchases to see if they own it
      if (user?.role === "CLIENT") {
         const purchasesRes = await api.get("/templates/client/purchases");
         const owns = purchasesRes.data.purchases.some((p: { templateId: string }) => p.templateId === id);
         setHasPurchased(owns);
      }
    } catch (error) {
      console.error(error);
      toast.error("Template not found.");
      router.push("/templates");
    } finally {
      setLoading(false);
    }
  }, [id, router, user]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please log in to purchase templates.");
      router.push("/login");
      return;
    }

    if (user.role !== "CLIENT") {
      toast.error("Only clients can purchase templates.");
      return;
    }

    setPurchasing(true);
    try {
      // Simulating the purchase flow for templates for now
      const { data } = await api.post(`/templates/${id}/purchase`);
      toast.success(data.message);
      setHasPurchased(true);
      
      // Auto-trigger download after purchase
      handleDownload();
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.error || "Failed to purchase template.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await api.get(`/templates/${id}/download`);
      
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = data.fileUrl; // This should be a direct R2/S3 URL or presigned URL
      link.download = data.fileName || "template.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.error || "Failed to download template.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading template details...</div>;
  if (!template) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Button variant="ghost" onClick={() => router.push("/templates")} className="-ml-4 mb-2">
        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Marketplace
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="px-3 py-1 text-sm">{template.category}</Badge>
              <span className="text-sm text-muted-foreground">
                Added {format(new Date(template.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{template.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {template.description}
            </p>
          </div>
          
          <div className="bg-muted/30 border rounded-xl p-6 space-y-4">
             <h3 className="font-semibold text-lg flex items-center">
                 <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />
                 Verified Legal Document
             </h3>
             <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                 <li>Drafted and verified by practicing Indian lawyers.</li>
                 <li>Up-to-date with current legal standards and practices.</li>
                 <li>Instant digital download in PDF format.</li>
                 <li>Includes standard clauses to protect your interests.</li>
             </ul>
          </div>
        </div>

        {/* Purchase Card */}
        <div>
          <Card className="sticky top-6 shadow-xl border-primary/20">
            <CardHeader className="text-center pb-2 bg-muted/20 border-b">
              <CardTitle className="text-4xl font-extrabold text-primary">₹{template.price}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">One-time purchase</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm py-2 border-b border-dashed">
                 <span className="text-muted-foreground">Downloads</span>
                 <span className="font-medium">{template.downloads}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-dashed">
                 <span className="text-muted-foreground">Category</span>
                 <span className="font-medium">{template.category}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-dashed">
                 <span className="text-muted-foreground">Format</span>
                 <span className="font-medium">PDF Document</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 pt-2 pb-6">
               {(user?.role === "ADMIN" || hasPurchased) ? (
                  <Button 
                    className="w-full text-lg h-12 gap-2" 
                    size="lg" 
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    <Download className="w-5 h-5" />
                    {downloading ? "Downloading..." : "Download File"}
                  </Button>
               ) : (
                  <Button 
                    className="w-full text-lg h-12 gap-2" 
                    size="lg"
                    onClick={handlePurchase}
                    disabled={purchasing}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {purchasing ? "Processing..." : "Purchase Now"}
                  </Button>
               )}
               
               {hasPurchased && (
                  <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1 w-full text-center">
                      <CheckCircle className="w-3 h-3" /> You own this template
                  </p>
               )}
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}
