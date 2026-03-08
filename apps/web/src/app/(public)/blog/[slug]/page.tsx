'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/store/auth'
import { Clock, Eye, Tag, Send, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  coverImage?: string
  views: number
  createdAt: string
  author: {
    name: string
    avatar?: string
    lawyerProfile?: { specializations: string[]; avgRating: number }
  }
  comments: {
    id: string
    content: string
    createdAt: string
    author: { name: string; avatar?: string }
  }[]
}

export default function BlogArticlePage() {
  const params = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!params?.slug) return
    api.get(`/blog/${params.slug}`)
      .then(r => setPost(r.data.post))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params?.slug])

  const submitComment = async () => {
    if (!user) return toast.error('Login to comment')
    if (!comment.trim()) return toast.error('Add comment text')
    setSubmitting(true)
    try {
      const { data } = await api.post(`/blog/${post!.id}/comments`, { content: comment.trim() })
      setPost(prev => prev ? { ...prev, comments: [...prev.comments, data.comment] } : prev)
      setComment('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">📰</p>
      <p className="text-foreground text-xl font-bold">Article not found</p>
      <Link href="/blog" className="text-primary hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" />Back to Blog
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-muted overflow-hidden">
        {post.coverImage && (
          <Image src={post.coverImage} alt={post.title} fill className="object-cover opacity-60" unoptimized />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
          <Link href="/blog" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <Badge variant="secondary" className="mb-2">{post.category}</Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">{post.title}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Meta */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {post.author.name[0]}
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">{post.author.name}</p>
              {post.author.lawyerProfile && (
                <p className="text-muted-foreground text-xs">{post.author.lawyerProfile.specializations.slice(0, 2).join(', ')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(post.createdAt), 'dd MMM yyyy')}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views} views</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="gap-1 text-xs">
                <Tag className="w-3 h-3" />{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <Card>
          <CardContent className="p-6 prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground">
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4 pt-2">
          <h2 className="font-semibold text-foreground text-lg">Comments ({post.comments.length})</h2>

          {post.comments.length === 0 && (
            <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
          )}

          {post.comments.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold">
                    {c.author.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-foreground text-sm font-medium">{c.author.name}</span>
                      <span className="text-muted-foreground text-xs">{format(new Date(c.createdAt), 'dd MMM')}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{c.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add comment */}
          {user ? (
            <div className="flex gap-2">
              <Input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a public comment…"
                onKeyDown={e => e.key === 'Enter' && submitComment()}
              />
              <Button
                onClick={submitComment}
                disabled={submitting || !comment.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">Login</Link> to add a comment.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
