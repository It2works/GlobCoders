import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  BookOpen,
  Brain,
  Zap,
  Users,
  Calendar
} from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface StudentAnalyticsProps {
  studentId?: number
  className?: string
}

interface AnalyticsData {
  overview: {
    totalStudents: number
    activeEnrollments: number
    completedEnrollments: number
    totalRevenue: number
    monthlyRevenue: number
    averageAge: number
  }
  coursePerformance: Array<{
    courseId: string
    courseTitle: string
    enrollments: number
    revenue: number
    averageProgress: number
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    enrollments: number
  }>
  recentActivity: Array<{
    studentName: string
    courseTitle: string
    progress: number
    enrolledAt: string
  }>
}

const StudentAnalytics = ({ studentId, className }: StudentAnalyticsProps) => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/analytics/teacher/${user?._id}`)
        setAnalytics(response.data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Erreur lors du chargement des analytics')
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) {
      fetchAnalytics()
    }
  }, [user?._id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Chargement des analytics...</span>
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

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    )
  }

  const { overview, coursePerformance, monthlyTrends, recentActivity } = analytics

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Students */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Élèves Inscrits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overview.totalStudents}</div>
            <div className="flex items-center text-sm text-success">
              <Users className="h-3 w-3 mr-1" />
              {overview.activeEnrollments} actifs
            </div>
          </CardContent>
        </Card>

        {/* Active Enrollments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inscriptions Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overview.activeEnrollments}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-3 w-3 mr-1" />
              {overview.completedEnrollments} terminés
            </div>
          </CardContent>
        </Card>

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
              {overview.monthlyRevenue.toFixed(2)}€ ce mois
            </div>
          </CardContent>
        </Card>

        {/* Average Age */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Âge Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overview.averageAge} ans</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              Moyenne des élèves
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance des Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coursePerformance.map((course) => (
              <div key={course.courseId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{course.courseTitle}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{course.enrollments} élèves</span>
                    <span>{course.revenue.toFixed(2)}€</span>
                    <span>Progression: {course.averageProgress.toFixed(1)}%</span>
                  </div>
                </div>
                <Progress value={course.averageProgress} className="w-32" />
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
                    <span>{trend.enrollments} inscriptions</span>
                    <span>{trend.revenue.toFixed(2)}€</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{trend.revenue.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">{trend.enrollments} élèves</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{activity.studentName}</h3>
                  <p className="text-sm text-muted-foreground">{activity.courseTitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={activity.progress} className="w-32" />
                    <span className="text-sm">{activity.progress}%</span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {new Date(activity.enrolledAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { StudentAnalytics }