import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  DollarSign,
  Activity,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  GraduationCap,
  UserCheck,
  Calendar,
  Star,
  Award,
  Zap,
  Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AdvancedAnalyticsDashboardProps {
  className?: string
}

interface AnalyticsData {
  kpis: {
    totalUsers: number
    totalCourses: number
    totalRevenue: number
    totalSessions: number
    activeUsers: number
    courseCompletionRate: number
    averageRating: number
    supportTickets: number
  }
  trends: {
    usersGrowth: number
    coursesGrowth: number
    revenueGrowth: number
    sessionsGrowth: number
  }
  students: {
    totalEnrolled: number
    activeStudents: number
    completedStudents: number
    averageAge: number
    newThisMonth: number
  }
  coursePerformance: Array<{
    name: string
    students: number
    revenue: number
    progress: number
    rating: number
    status: string
  }>
  monthlyTrends: Array<{
    month: string
    enrollments: number
    revenue: number
    students: number
  }>
  chartData: {
    systemHealth: {
      cpu: number
      memory: number
      storage: number
      bandwidth: number
    }
  }
  recentActivity: Array<{
    action: string
    user: string
    time: string
    type: 'success' | 'warning' | 'info' | 'error'
  }>
}

const AdvancedAnalyticsDashboard = ({ className }: AdvancedAnalyticsDashboardProps) => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real analytics data from API
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch from your real API endpoints
      const [kpisResponse, studentsResponse, coursesResponse, trendsResponse] = await Promise.all([
        fetch('/api/analytics/kpis'),
        fetch('/api/analytics/students'),
        fetch('/api/analytics/courses'),
        fetch('/api/analytics/trends')
      ])

      if (!kpisResponse.ok || !studentsResponse.ok || !coursesResponse.ok || !trendsResponse.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const [kpis, students, courses, trends] = await Promise.all([
        kpisResponse.json(),
        studentsResponse.json(),
        coursesResponse.json(),
        trendsResponse.json()
      ])

      // Transform API data to match our interface
      const transformedData: AnalyticsData = {
        kpis: {
          totalUsers: kpis.totalUsers || 0,
          totalCourses: kpis.totalCourses || 0,
          totalRevenue: kpis.totalRevenue || 0,
          totalSessions: kpis.totalSessions || 0,
          activeUsers: kpis.activeUsers || 0,
          courseCompletionRate: kpis.courseCompletionRate || 0,
          averageRating: kpis.averageRating || 0,
          supportTickets: kpis.supportTickets || 0
        },
        trends: {
          usersGrowth: trends.usersGrowth || 0,
          coursesGrowth: trends.coursesGrowth || 0,
          revenueGrowth: trends.revenueGrowth || 0,
          sessionsGrowth: trends.sessionsGrowth || 0
        },
        students: {
          totalEnrolled: students.totalEnrolled || 0,
          activeStudents: students.activeStudents || 0,
          completedStudents: students.completedStudents || 0,
          averageAge: students.averageAge || 0,
          newThisMonth: students.newThisMonth || 0
        },
        coursePerformance: courses.performance || [],
        monthlyTrends: trends.monthly || [],
        chartData: {
          systemHealth: {
            cpu: kpis.systemHealth?.cpu || 0,
            memory: kpis.systemHealth?.memory || 0,
            storage: kpis.systemHealth?.storage || 0,
            bandwidth: kpis.systemHealth?.bandwidth || 0
          }
        },
        recentActivity: trends.recentActivity || []
      }

      setAnalytics(transformedData)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
      
      // Set empty data as fallback for production
      setAnalytics({
        kpis: { totalUsers: 0, totalCourses: 0, totalRevenue: 0, totalSessions: 0, activeUsers: 0, courseCompletionRate: 0, averageRating: 0, supportTickets: 0 },
        trends: { usersGrowth: 0, coursesGrowth: 0, revenueGrowth: 0, sessionsGrowth: 0 },
        students: { totalEnrolled: 0, activeStudents: 0, completedStudents: 0, averageAge: 0, newThisMonth: 0 },
        coursePerformance: [],
        monthlyTrends: [],
        chartData: { systemHealth: { cpu: 0, memory: 0, storage: 0, bandwidth: 0 } },
        recentActivity: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement des analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchAnalytics} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs Totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">{analytics.kpis.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-sm text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.trends.usersGrowth > 0 ? '+' : ''}{analytics.trends.usersGrowth}% ce mois
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Cours Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-2">{analytics.kpis.totalCourses}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.trends.coursesGrowth > 0 ? '+' : ''}{analytics.trends.coursesGrowth}% ce mois
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenus Totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-2">{analytics.kpis.totalRevenue.toLocaleString()}€</div>
            <div className="flex items-center text-sm text-purple-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.trends.revenueGrowth > 0 ? '+' : ''}{analytics.trends.revenueGrowth}% ce mois
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sessions Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-2">{analytics.kpis.totalSessions.toLocaleString()}</div>
            <div className="flex items-center text-sm text-orange-600">
              {analytics.trends.sessionsGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {analytics.trends.sessionsGrowth > 0 ? '+' : ''}{analytics.trends.sessionsGrowth}% ce mois
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Élèves Inscrits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900 mb-2">{analytics.students.totalEnrolled}</div>
            <div className="flex items-center text-sm text-indigo-600">
              <UserCheck className="h-3 w-3 mr-1" />
              {analytics.students.activeStudents} actifs
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Inscriptions Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 mb-2">{analytics.students.activeStudents}</div>
            <div className="flex items-center text-sm text-emerald-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              {analytics.students.completedStudents} terminés
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenus Totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900 mb-2">{analytics.kpis.totalRevenue.toLocaleString()}€</div>
            <div className="flex items-center text-sm text-amber-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.monthlyTrends.length > 0 ? analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.revenue.toLocaleString() : 0}€ ce mois
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Âge Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-900 mb-2">{analytics.students.averageAge} ans</div>
            <div className="flex items-center text-sm text-rose-600">
              <Zap className="h-3 w-3 mr-1" />
              Moyenne des élèves
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Section */}
      <Card className="mb-8 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="h-5 w-5 text-primary" />
            Performance des Cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.coursePerformance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.coursePerformance.map((course, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-slate-800">{course.name}</h3>
                    <Badge
                      variant={course.status === 'free' ? 'secondary' : 'default'}
                      className={course.status === 'free' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {course.status === 'free' ? 'Gratuit' : 'Premium'}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Élèves</span>
                      <span className="font-semibold text-slate-800">{course.students}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Revenus</span>
                      <span className="font-semibold text-slate-800">{course.revenue.toLocaleString()}€</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progression</span>
                        <span className="font-medium text-slate-800">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-slate-600">{course.rating}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun cours disponible pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends Section */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calendar className="h-5 w-5 text-blue-600" />
            Tendances Mensuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthlyTrends.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <h4 className="font-semibold text-sm text-blue-900 mb-3 text-center">{trend.month}</h4>

                  <div className="space-y-2 text-center">
                    <div>
                      <div className="text-xs text-blue-600">Inscriptions</div>
                      <div className="font-bold text-blue-900">{trend.enrollments}</div>
                    </div>

                    <div>
                      <div className="text-xs text-blue-600">Revenus</div>
                      <div className="font-bold text-blue-900">{trend.revenue.toLocaleString()}€</div>
                    </div>

                    <div>
                      <div className="text-xs text-blue-600">Élèves</div>
                      <div className="font-bold text-blue-900">{trend.students}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune tendance disponible pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Target className="h-5 w-5 text-primary" />
              Métriques de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Utilisateurs Actifs</span>
                <span className="text-sm text-slate-500">
                  {analytics.kpis.activeUsers} / {analytics.kpis.totalUsers}
                </span>
              </div>
              <Progress value={analytics.kpis.totalUsers > 0 ? (analytics.kpis.activeUsers / analytics.kpis.totalUsers) * 100 : 0} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Taux de Complétion</span>
                <span className="text-sm text-slate-500">{analytics.kpis.courseCompletionRate}%</span>
              </div>
              <Progress value={analytics.kpis.courseCompletionRate} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Note Moyenne</span>
                <span className="text-sm text-slate-500">{analytics.kpis.averageRating}/5</span>
              </div>
              <Progress value={(analytics.kpis.averageRating / 5) * 100} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Tickets Support</span>
                <Badge variant={analytics.kpis.supportTickets > 30 ? "destructive" : "secondary"}>
                  {analytics.kpis.supportTickets} ouverts
                </Badge>
              </div>
              <Progress
                value={Math.min((analytics.kpis.supportTickets / 100) * 100, 100)}
                className={`h-3 ${analytics.kpis.supportTickets > 30 ? "bg-destructive/20" : ""}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Activity className="h-5 w-5 text-green-600" />
              Santé du Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">CPU</span>
                <span className="text-sm text-green-600">{analytics.chartData.systemHealth.cpu}%</span>
              </div>
              <Progress
                value={analytics.chartData.systemHealth.cpu}
                className={`h-3 ${analytics.chartData.systemHealth.cpu > 80 ? "bg-destructive/20" : ""}`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">Mémoire</span>
                <span className="text-sm text-green-600">{analytics.chartData.systemHealth.memory}%</span>
              </div>
              <Progress
                value={analytics.chartData.systemHealth.memory}
                className={`h-3 ${analytics.chartData.systemHealth.memory > 80 ? "bg-destructive/20" : ""}`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">Stockage</span>
                <span className="text-sm text-green-600">{analytics.chartData.systemHealth.storage}%</span>
              </div>
              <Progress value={analytics.chartData.systemHealth.storage} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">Bande Passante</span>
                <span className="text-sm text-green-600">{analytics.chartData.systemHealth.bandwidth}%</span>
              </div>
              <Progress value={analytics.chartData.systemHealth.bandwidth} className="h-3" />
            </div>

            <div className="pt-4 border-t border-green-200">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">Système Opérationnel</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Clock className="h-5 w-5 text-primary" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                        activity.type === 'info' ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />
                    <div>
                      <div className="font-medium text-slate-800">{activity.action}</div>
                      <div className="text-sm text-slate-600">Par {activity.user}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{activity.time}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune activité récente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-300">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="font-medium text-slate-700">Rapport Détaillé</span>
        </Button>
        <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-300">
          <PieChart className="h-8 w-8 text-green-600" />
          <span className="font-medium text-slate-700">Analytics Avancées</span>
        </Button>
        <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-300">
          <LineChart className="h-8 w-8 text-purple-600" />
          <span className="text-slate-700 font-medium">Tendances</span>
        </Button>
      </div>
    </div>
  )
}

export { AdvancedAnalyticsDashboard }