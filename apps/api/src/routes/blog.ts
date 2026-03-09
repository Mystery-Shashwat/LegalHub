import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/guards'

export const blogRouter = Router()

// Utility: generate slug from title
function slugify(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// GET /blog — public listing or management listing
blogRouter.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const category = req.query.category as string | undefined
    const authorId = req.query.authorId as string | undefined
    const skip = (page - 1) * limit

    // If authorId is provided, we check if the requester is that author or an admin
    // to determine if we should show drafts as well.
    let showAll = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authorId) {
        try {
            const { verifyAccess } = await import('../lib/tokens');
            const user = verifyAccess(authHeader.split(' ')[1]);
            if (user && (user.userId === authorId || user.role === 'ADMIN')) {
                showAll = true;
            }
        } catch (e) {}
    }

    const where: any = {}
    if (!showAll) where.isPublished = true
    if (category) where.category = category
    if (authorId) where.authorId = authorId

    const [posts, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          tags: true,
          coverImage: true,
          views: true,
          isPublished: true,
          createdAt: true,
          author: { select: { name: true, avatar: true } },
          _count: { select: { comments: true } }
        }
      }),
      prisma.blog.count({ where })
    ])

    const categories = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category']
    })

    res.json({ posts, total, page, pages: Math.ceil(total / limit), categories: categories.map(c => c.category) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

// GET /blog/:slug — single article with comments
blogRouter.get('/:slug', async (req: any, res: any) => {
  try {
    const post = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: { select: { name: true, avatar: true, lawyerProfile: { select: { specializations: true, avgRating: true } } } },
        comments: {
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!post) return res.status(404).json({ error: 'Article not found' })
    
    // If not published, only author or admin can see
    if (!post.isPublished) {
        const authHeader = req.headers.authorization;
        let canSee = false;
        if (authHeader) {
            try {
                const { verifyAccess } = await import('../lib/tokens');
                const user = verifyAccess(authHeader.split(' ')[1]);
                if (user && (user.userId === post.authorId || user.role === 'ADMIN')) canSee = true;
            } catch (e) {}
        }
        if (!canSee) return res.status(403).json({ error: 'This post is not published' });
    }

    // Increment view count (fire and forget)
    prisma.blog.update({ where: { slug: req.params.slug }, data: { views: { increment: 1 } } }).catch(() => {})

    res.json({ post })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

// GET /blog-details/:id — for editor
blogRouter.get('/details/:id', requireAuth, async (req: any, res: any) => {
    try {
        const post = await prisma.blog.findUnique({ where: { id: req.params.id } });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        if (post.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        res.json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /blog — lawyer/admin creates a blog post
blogRouter.post('/', requireAuth, async (req: any, res: any) => {
  try {
    const { title, excerpt, content, category, tags, coverImage, isPublished } = req.body

    if (!title || !excerpt || !content) {
      return res.status(400).json({ error: 'title, excerpt, and content are required' })
    }

    let slug = slugify(title)
    const existing = await prisma.blog.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const post = await prisma.blog.create({
      data: {
        authorId: req.user.userId,
        title,
        slug,
        excerpt,
        content,
        category: category || 'Legal Insights',
        tags: Array.isArray(tags) ? tags : [],
        coverImage: coverImage || null,
        isPublished: Boolean(isPublished)
      }
    })

    res.status(201).json({ post })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create blog post' })
  }
})

// PUT /blog/:id — author updates their post
blogRouter.put('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const post = await prisma.blog.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { title, excerpt, content, category, tags, coverImage, isPublished } = req.body
    const updated = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title, slug: slugify(title) }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(category && { category }),
        ...(tags && { tags }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublished !== undefined && { isPublished })
      }
    })

    res.json({ post: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

// DELETE /blog/:id — delete a post
blogRouter.delete('/:id', requireAuth, async (req: any, res: any) => {
    try {
        const post = await prisma.blog.findUnique({ where: { id: req.params.id } });
        if (!post) return res.status(404).json({ error: 'Not found' });
        
        if (post.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        await prisma.blog.delete({ where: { id: req.params.id } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /blog/:id/comments — add a comment
blogRouter.post('/:id/comments', requireAuth, async (req: any, res: any) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Comment text is required' })

    const post = await prisma.blog.findUnique({ where: { id: req.params.id } })
    if (!post || !post.isPublished) return res.status(404).json({ error: 'Post not found' })

    const comment = await prisma.blogComment.create({
      data: { blogId: req.params.id, authorId: req.user.userId, content: content.trim() },
      include: { author: { select: { name: true, avatar: true } } }
    })

    res.status(201).json({ comment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})
