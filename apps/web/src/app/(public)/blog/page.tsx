"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, User } from "lucide-react"

const MOCK_POSTS = [
    {
        id: "1",
        title: "Understanding Your Rights in Family Court: A Comprehensive Guide",
        excerpt: "Navigating family law can be overwhelming. Learn the basics of custody, alimony, and property division.",
        category: "Family Law",
        author: "Adv. Meera Reddy",
        date: "Oct 15, 2023",
        readTime: "5 min read",
        imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "2",
        title: "5 Crucial Updates to the Indian Penal Code You Must Know",
        excerpt: "Recent legislative changes have altered how criminal cases are processed. Stay informed on the latest amendments.",
        category: "Criminal Law",
        author: "Adv. Arjun Kapoor",
        date: "Sep 28, 2023",
        readTime: "8 min read",
        imageUrl: "https://images.unsplash.com/photo-1505664124738-02ce2887d1aa?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "3",
        title: "How to Protect Your Startup's Intellectual Property",
        excerpt: "Don't let your ideas get stolen. Discover the essential steps to trademark and patent your innovations.",
        category: "Corporate Law",
        author: "LegalHub Team",
        date: "Sep 12, 2023",
        readTime: "6 min read",
        imageUrl: "https://images.unsplash.com/photo-1620608552391-da13eec7e828?auto=format&fit=crop&q=80&w=800"
    }
]

export default function BlogPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Legal Insights & News</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Stay up-to-date with the latest legal developments, practical advice from verified experts, and platform news.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_POSTS.map(post => (
                    <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                        <div 
                            className="h-48 w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${post.imageUrl})` }}
                        />
                        <CardHeader>
                            <div className="flex justify-between items-center mb-2">
                                <Badge variant="secondary">{post.category}</Badge>
                                <span className="text-xs text-muted-foreground">{post.readTime}</span>
                            </div>
                            <CardTitle className="line-clamp-2 md:line-clamp-3">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-4 border-t pt-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{post.date}</span>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full justify-between" onClick={() => alert("Blog detail view coming soon in Phase 5!")}>
                                Read Article
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
