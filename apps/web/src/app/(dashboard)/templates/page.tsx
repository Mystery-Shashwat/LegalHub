"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  downloads: number;
}

export default function TemplatesMarketplacePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams();
      if (searchQuery) qParams.set("search", searchQuery);
      if (category !== "All") qParams.set("category", category);
      
      const { data } = await api.get(`/templates?${qParams.toString()}`);
      setTemplates(data.templates);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTemplates();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, category]);

  const categories = ["All", "Business", "Real Estate", "Personal", "Employment"];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Document Templates
        </h1>
        <p className="text-muted-foreground mt-1">Purchase and instantly download standard legal document templates crafted by experts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search templates by title or keywords..." 
            className="pl-10 h-12 bg-background border-muted-foreground/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {categories.map((cat) => (
            <Badge 
              key={cat} 
              variant={category === cat ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer text-sm font-medium whitespace-nowrap"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center bg-muted/20 border-dashed">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search criteria.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link key={template.id} href={`/templates/${template.id}`} className="block h-full">
              <Card className="hover:shadow-lg transition-all h-full flex flex-col hover:border-primary/50 group">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <Badge variant="secondary">{template.category}</Badge>
                    <span className="font-bold text-lg text-primary">₹{template.price}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-auto">
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" /> {template.downloads} downloads
                    </span>
                    <span className="flex items-center">
                       <CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Verified
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/10">
                  <Button variant="ghost" className="w-full justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
