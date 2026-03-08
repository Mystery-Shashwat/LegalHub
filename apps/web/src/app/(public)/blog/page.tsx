'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'
import { Search, Clock, Eye, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  coverImage?: string
  views: number
  createdAt: string
  author: { name: string; avatar?: string }
  _count: { comments: number }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPosts = async (cat?: string, p = 1) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: p, limit: 9 }
      if (cat) params.category = cat
      const { data } = await api.get('/blog', { params })
      setPosts(p === 1 ? data.posts : (prev: BlogPost[]) => [...prev, ...data.posts])
      setCategories(data.categories || [])
      setTotalPages(data.pages || 1)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts(activeCategory || undefined, 1) }, [activeCategory])

  const filtered = posts.filter(p =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Legal Insights Blog</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Expert articles from verified lawyers on Indian law, rights, and legal processes.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeCategory === '' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('')}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Post Grid */}
        {loading && filtered.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-muted rounded-lg h-72 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-muted/10 border-dashed">
            <p className="text-4xl mb-3">📰</p>
            <h3 className="text-lg font-medium text-foreground">No articles yet</h3>
            <p className="text-muted-foreground mt-1 text-sm">Check back soon for expert legal insights.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                  {/* Cover */}
                  <div className="h-44 bg-muted relative overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-5xl opacity-20">⚖</div>
                    )}
                    <Badge className="absolute top-3 left-3" variant="secondary">{post.category}</Badge>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h2 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(post.createdAt), 'dd MMM yyyy')}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post._count.comments}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {post.author.name[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">{post.author.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {page < totalPages && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => { const next = page + 1; setPage(next); fetchPosts(activeCategory || undefined, next) }}
            >
              Load more articles
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
