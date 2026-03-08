"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";

interface Purchase {
  id: string;
  amountPaid: number;
  status: string;
  createdAt: string;
  template: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role !== "CLIENT") {
      router.push("/dashboard");
      return;
    }

    const fetchPurchases = async () => {
      try {
        const { data } = await api.get("/templates/client/purchases");
        setPurchases(data.purchases);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load your template purchases.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user, router]);

  const handleDownload = async (templateId: string) => {
    setDownloadingId(templateId);
    try {
      const { data } = await api.get(`/templates/${templateId}/download`);
      
      const link = document.createElement("a");
      link.href = data.fileUrl; 
      link.download = data.fileName || "template.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (e: unknown) {
      const errorResponse = e as { response?: { data?: { error?: string } } };
      toast.error(errorResponse.response?.data?.error || "Failed to download template.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (!user || user.role !== "CLIENT") return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          My Purchased Templates
        </h1>
        <p className="text-muted-foreground mt-1">Access and download your historically purchased legal templates.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground">Loading your library...</div>
      ) : purchases.length === 0 ? (
        <Card className="p-12 text-center bg-muted/20 border-dashed">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No purchases yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">You havent bought any document templates from the marketplace.</p>
          <Button asChild>
            <Link href="/templates">Browse Marketplace</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {purchases.map(({ id, amountPaid, createdAt, template }) => (
            <Card key={id} className="flex flex-col h-full border-primary/20 hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/10 pb-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                   <Badge variant="secondary" className="truncate max-w-[120px]">{template.category}</Badge>
                   <span className="text-xs text-muted-foreground flex items-center shrink-0">
                     <Clock className="w-3 h-3 mr-1" />
                     {format(new Date(createdAt), "MMM d, yyyy")}
                   </span>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2" title={template.title}>
                  {template.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                 <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                   {template.description}
                 </p>
                 <p className="text-sm font-medium mt-auto">
                   Amount Paid: <span className="text-primary font-bold">₹{amountPaid}</span>
                 </p>
              </CardContent>
              <CardFooter className="pt-4 border-t gap-2 flex-col sm:flex-row">
                 <Button 
                   variant="outline" 
                   className="w-full"
                   asChild
                 >
                   <Link href={`/templates/${template.id}`}>View Details</Link>
                 </Button>
                 <Button 
                   className="w-full gap-2"
                   disabled={downloadingId === template.id}
                   onClick={() => handleDownload(template.id)}
                 >
                   <Download className="w-4 h-4" />
                   {downloadingId === template.id ? "Downloading..." : "Download"}
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
