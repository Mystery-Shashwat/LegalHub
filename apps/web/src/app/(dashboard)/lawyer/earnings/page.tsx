'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { AxiosError } from 'axios'
import { TrendingUp, Wallet, Calendar, Star, ArrowDownToLine, IndianRupee, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Payment {
  id: string
  clientName: string
  amount: number
  platformFee: number
  lawyerPayout: number
  paidAt: string | null
  scheduledAt: string
  type: string
}

interface EarningsData {
  totalEarnings: number
  totalBookings: number
  monthlyEarnings: number
  pendingPayout: number
  avgRating: number
  payments: Payment[]
}

export default function LawyerEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    api.get('/lawyers/me/earnings')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load earnings'))
      .finally(() => setLoading(false))
  }, [])

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < 500) return toast.error('Minimum withdrawal is ₹500')
    setWithdrawing(true)
    try {
      await api.post('/lawyers/me/withdraw', { amount })
      toast.success('Withdrawal request submitted! Processing in 2 business days.')
      setWithdrawAmount('')
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : undefined
      toast.error(msg || 'Failed to submit withdrawal')
    } finally {
      setWithdrawing(false)
    }
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Earnings & Payouts</h1>
        <p className="text-muted-foreground hidden md:block">Track your consultation revenue and request withdrawals.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-8 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))
        ) : (
          <>
            {[
              { label: 'Total Earnings', value: fmt(data?.totalEarnings ?? 0), icon: <IndianRupee className="h-4 w-4 text-muted-foreground" /> },
              { label: 'This Month', value: fmt(data?.monthlyEarnings ?? 0), icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
              { label: 'Total Sessions', value: String(data?.totalBookings ?? 0), icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
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

      {/* Withdrawal Card */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-5 h-5 text-primary" /> Request Withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-muted-foreground text-sm">
            Weekly payouts every Monday. Minimum withdrawal: ₹500 | UPI instant transfer up to ₹1,00,000.
          </p>
          <div className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                min="500"
                className="pl-7"
              />
            </div>
            <Button onClick={handleWithdraw} disabled={withdrawing} className="gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              {withdrawing ? 'Submitting…' : 'Withdraw'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : !data || data.payments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <IndianRupee className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payments yet. Complete consultations to earn.</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.payments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{p.clientName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="secondary" className="capitalize text-[10px] h-4 font-normal">{p.type}</Badge>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(p.scheduledAt), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{fmt(p.lawyerPayout)}</p>
                    <p className="text-xs text-muted-foreground">of {fmt(p.amount)} total</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
