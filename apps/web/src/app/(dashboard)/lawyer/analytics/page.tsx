'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Star, Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalyticsData {
  monthlyData: { month: string; bookings: number; revenue: number }[]
  totalBookings: number
  completedBookings: number
  avgRating: number
  totalReviews: number
  recentReviews: { rating: number; createdAt: string }[]
}

// Custom tooltip for revenue chart
interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}
const RevenueTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg px-3 py-2 text-sm shadow-md">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return null
}

export default function LawyerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/lawyers/me/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const completionRate = data && data.totalBookings > 0
    ? Math.round((data.completedBookings / data.totalBookings) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Performance Analytics</h1>
        <p className="text-muted-foreground hidden md:block">Your last 6 months — bookings, revenue, and client satisfaction.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-8 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))
        ) : (
          <>
            {[
              { label: 'Total Bookings', value: String(data?.totalBookings ?? 0), icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
              { label: 'Completed', value: String(data?.completedBookings ?? 0), icon: <Users className="h-4 w-4 text-muted-foreground" /> },
              { label: 'Completion Rate', value: `${completionRate}%`, icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
              { label: 'Avg Rating', value: data && data.avgRating > 0 ? `${data.avgRating.toFixed(1)} ★` : '—', icon: <Star className="h-4 w-4 text-muted-foreground" /> },
            ].map(stat => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {data && (
        <>
          {/* Bookings Chart */}
          {data.monthlyData.length > 0 && (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Monthly Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }} />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Revenue Chart */}
          {data.monthlyData.length > 0 && (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Monthly Revenue (after fees)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v: number) => `₹${v}`} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Rating Breakdown */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Client Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {data.totalReviews === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No reviews yet. Complete consultations to get ratings.</p>
              ) : (
                <div className="flex items-center gap-8">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-bold text-foreground">{data.avgRating.toFixed(1)}</p>
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(data.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">{data.totalReviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5,4,3,2,1].map(star => {
                      const count = data.recentReviews.filter(r => r.rating === star).length
                      const pct = data.recentReviews.length ? (count / data.recentReviews.length) * 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-3">{star}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-4">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !data && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No analytics data available yet.</p>
        </Card>
      )}
    </div>
  )
}
