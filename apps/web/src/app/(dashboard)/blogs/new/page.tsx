"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
// import { useAuth } from "@/store/auth"; // removed unused
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function BlogEditorPage() {
  const router = useRouter();
  const { id } = useParams() as { id?: string };
  // const { user } = useAuth(); // removed unused
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [categories] = useState<string[]>(["Legal Insights", "Case Studies", "Platform Updates", "Compliance", "News"]);
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Legal Insights",
    tags: [] as string[],
    coverImage: "",
    isPublished: false
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (id) {
        const fetchPost = async () => {
            try {
                // We need an endpoint to get post by ID or slug but including private data
                // For now we'll assume the public /blog/:slug or similar works if author
                // But typically for editor we want GET /blog/:id
                const { data } = await api.get(`/blog-details/${id}`); // Assuming a details endpoint
                setFormData({
                    title: data.post.title,
                    excerpt: data.post.excerpt,
                    content: data.post.content,
                    category: data.post.category,
                    tags: data.post.tags || [],
                    coverImage: data.post.coverImage || "",
                    isPublished: data.post.isPublished
                });
            } catch (error) {
                console.error("Failed to fetch post", error);
                toast.error("Failed to load post for editing");
            } finally {
                setFetching(false);
            }
        };
        fetchPost();
    }
  }, [id]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
        e.preventDefault();
        if (!formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
        }
        setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.excerpt) {
        toast.error("Please fill in all required fields");
        return;
    }

    try {
        setLoading(true);
        if (id) {
            await api.put(`/blog/${id}`, formData);
            toast.success("Post updated successfully");
        } else {
            await api.post("/blog", formData);
            toast.success("Post created successfully");
        }
        router.push("/blogs");
    } catch (error) {
        console.error("Save failed", error);
        toast.error("Failed to save post");
    } finally {
        setLoading(false);
    }
  };

  if (fetching) {
      return (
          <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="-ml-2">
            <Link href="/blogs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
            </Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {id ? "Edit blog post" : "Create new blog post"}
                </h1>
                <p className="text-muted-foreground">Share your legal expertise with the community.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-4">
                    <Label htmlFor="published" className="cursor-pointer">Published</Label>
                    <Switch 
                        id="published" 
                        checked={formData.isPublished}
                        onCheckedChange={(val) => setFormData({ ...formData, isPublished: val })}
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {id ? "Update Post" : "Create Post"}
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Article Details</CardTitle>
                <CardDescription>Main info about your legal insight.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                    <Input 
                        id="title" 
                        placeholder="e.g. Understanding the New Data Privacy Laws" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                            value={formData.category}
                            onValueChange={(val: string) => setFormData({ ...formData, category: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cover">Cover Image URL</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="cover" 
                                placeholder="Paste image URL here" 
                                value={formData.coverImage}
                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                            />
                            <Button type="button" variant="outline" size="icon">
                                <Upload className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt / Summary <span className="text-destructive">*</span></Label>
                    <Textarea 
                        id="excerpt" 
                        placeholder="A short summary that appears in listings..." 
                        className="h-20"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
                    <Textarea 
                        id="content" 
                        placeholder="Write your article here. Supports plain text for now." 
                        className="min-h-[400px] font-sans leading-relaxed text-base"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <Input 
                        placeholder="Type a tag and press Enter..." 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                    />
                </div>
            </CardContent>
        </Card>
      </form>
    </div>
  );
}
