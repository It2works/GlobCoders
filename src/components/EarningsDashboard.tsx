import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Target,
  Clock,
  CreditCard
} from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface EarningsDashboardProps {
  teacherId?: number
  className?: string
}

interface RevenueData {
  overview: {
    totalRevenue: number
    monthlyRevenue: number
    weeklyRevenue: number
    pendingRevenue: number
    failedRevenue: number
    sessionRevenue: number
    totalTransactions: number
    successfulTransactions: number
    successRate: number
  }
  revenueByCourse: Array<{
    courseId: string
    courseTitle: string
    totalRevenue: number
    pendingRevenue: number
    transactionCount: number
    successfulTransactions: number
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    sessions: number
    transactions: number
    successfulTransactions: number
  }>
  recentPayments: Array<{
    id: string
    amount: number
    status: string
    paymentMethod: string
    transactionId: string
    description: string
    createdAt: string
    courseTitle: string
  }>
}

const EarningsDashboard = ({ teacherId, className }: EarningsDashboardProps) => {
  const { user } = useAuth()
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/revenue/teacher/${user?._id}`)
        setRevenue(response.data)
      } catch (err) {
        console.error('Error fetching revenue:', err)
        setError('Erreur lors du chargement des données de revenus')
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) {
      fetchRevenue()
    }
  }, [user?._id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Chargement des revenus...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!revenue) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    )
  }

  const { overview, revenueByCourse, monthlyTrends, recentPayments } = revenue

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus Totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overview.totalRevenue.toFixed(2)}€</div>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              {overview.successRate}% de réussite
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ce Mois-ci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overview.monthlyRevenue.toFixed(2)}€</div>
            <div className="text-sm text-muted-foreground">
              {overview.totalTransactions} transactions
            </div>
          </CardContent>
        </Card>

        {/* Pending Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overview.pendingRevenue.toFixed(2)}€</div>
            <div className="flex items-center text-sm text-warning">
              <Clock className="h-3 w-3 mr-1" />
              À recevoir
            </div>
          </CardContent>
        </Card>

        {/* Session Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overview.sessionRevenue.toFixed(2)}€</div>
            <div className="text-sm text-muted-foreground">
              Revenus des sessions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Course */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenus par Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByCourse.map((course) => (
              <div key={course.courseId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{course.courseTitle}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{course.transactionCount} transactions</span>
                    <span>{course.successfulTransactions} réussies</span>
                    <span>{course.pendingRevenue.toFixed(2)}€ en attente</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{course.totalRevenue.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">
                    {course.transactionCount > 0
                      ? Math.round((course.successfulTransactions / course.transactionCount) * 100)
                      : 0}% de réussite
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tendances Mensuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{trend.month}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{trend.transactions} transactions</span>
                    <span>{trend.sessions} sessions</span>
                    <span>{trend.successfulTransactions} réussies</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{trend.revenue.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">
                    {trend.transactions > 0
                      ? Math.round((trend.successfulTransactions / trend.transactions) * 100)
                      : 0}% de réussite
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Paiements Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{payment.courseTitle}</h3>
                  <p className="text-sm text-muted-foreground">{payment.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={payment.status === 'reussi' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{payment.paymentMethod}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{payment.amount.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { EarningsDashboard }