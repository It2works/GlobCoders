import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/hooks/useAppData"
import {
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Award,
  Target,
  Calendar,
  TrendingUp
} from "lucide-react"

interface ProgressTrackingProps {
  className?: string
}

const ProgressTracking = ({ className }: ProgressTrackingProps) => {
  const { enrollments, dashboardStats, loading } = useAppData();

  // Use real data from MongoDB
  const progressData: {
    enrolledCourses: Array<{
      id: string;
      title: string;
      instructor: string;
      totalLessons: number;
      completedLessons: number;
      totalQuizzes: number;
      completedQuizzes: number;
      currentLesson: string;
      nextLesson: string | null;
      estimatedCompletion: string;
      startDate: string;
      progress: number;
      status: string;
      lastActivity: string;
      certificate: boolean;
    }>;
    overallStats: {
      totalCoursesEnrolled: number;
      totalCoursesCompleted: number;
      totalHoursStudied: number;
      averageProgress: number;
      totalCertificates: number;
      currentStreak: number;
      longestStreak: number;
    };
    weeklyActivity: Array<{
      day: string;
      hours: number;
      lessons: number;
    }>;
    achievements: Array<{
      name: string;
      description: string;
      earned: boolean;
      date: string;
      progress: number;
    }>;
  } = {
    enrolledCourses: enrollments.map(enrollment => ({
      id: enrollment._id,
      title: enrollment.course.title,
      instructor: `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`,
      totalLessons: enrollment.course.syllabus?.length || 0,
      completedLessons: Math.floor((enrollment.progress / 100) * (enrollment.course.syllabus?.length || 0)),
      totalQuizzes: 0, // Will be updated when quiz data is available
      completedQuizzes: 0, // Will be updated when quiz data is available
      currentLesson: enrollment.lastAccessedAt ? "Continuer" : "Commencer",
      nextLesson: enrollment.progress < 100 ? "Prochaine leçon" : "Cours terminé",
      estimatedCompletion: enrollment.completed ? "Terminé" : "En cours",
      startDate: new Date(enrollment.createdAt).toLocaleDateString('fr-FR'),
      progress: enrollment.progress,
      status: enrollment.completed ? "Terminé" : "En cours",
      lastActivity: enrollment.lastAccessedAt ? new Date(enrollment.lastAccessedAt).toLocaleDateString('fr-FR') : "Jamais",
      certificate: enrollment.certificate ? true : false
    })),
    overallStats: {
      totalCoursesEnrolled: enrollments.length,
      totalCoursesCompleted: enrollments.filter(e => e.completed).length,
      totalHoursStudied: 0, // Will be calculated from study sessions
      averageProgress: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0,
      totalCertificates: enrollments.filter(e => e.certificate).length,
      currentStreak: 0, // Will be calculated from activity data
      longestStreak: 0 // Will be calculated from activity data
    },
    weeklyActivity: [
      { day: "Lun", hours: 0, lessons: 0 },
      { day: "Mar", hours: 0, lessons: 0 },
      { day: "Mer", hours: 0, lessons: 0 },
      { day: "Jeu", hours: 0, lessons: 0 },
      { day: "Ven", hours: 0, lessons: 0 },
      { day: "Sam", hours: 0, lessons: 0 },
      { day: "Dim", hours: 0, lessons: 0 }
    ],
    achievements: [
      { name: "Premier Cours", description: "Compléter votre premier cours", earned: enrollments.some(e => e.completed), date: "", progress: 0 },
      { name: "Persévérant", description: "Étudier 5 jours consécutifs", earned: false, date: "", progress: 0 },
      { name: "Certifié", description: "Obtenir votre premier certificat", earned: enrollments.some(e => e.certificate), date: "", progress: 0 }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé": return "bg-success/10 text-success"
      case "En cours": return "bg-primary/10 text-primary"
      default: return "bg-muted/10 text-muted-foreground"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-success"
    if (progress >= 50) return "bg-primary"
    if (progress >= 25) return "bg-warning"
    return "bg-muted-foreground"
  }

  return (
    <div className={className}>
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{progressData.overallStats.totalCoursesCompleted}</div>
            <div className="text-sm text-muted-foreground">Cours Terminés</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{progressData.overallStats.totalHoursStudied}h</div>
            <div className="text-sm text-muted-foreground">Heures d'Étude</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{progressData.overallStats.averageProgress}%</div>
            <div className="text-sm text-muted-foreground">Progression Moy.</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{progressData.overallStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Jours Consécutifs</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Progression des Cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {progressData.enrolledCourses.map((course) => (
                <div key={course.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">Par {course.instructor}</p>
                    </div>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression générale</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>{course.completedLessons}/{course.totalLessons} leçons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span>{course.completedQuizzes}/{course.totalQuizzes} quiz</span>
                    </div>
                  </div>

                  {course.progress < 100 && (
                    <div className="space-y-1">
                      <div className="text-sm">
                        <strong>Actuellement:</strong> {course.currentLesson}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Prochaine étape:</strong> {course.nextLesson}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Temps estimé: {course.estimatedCompletion}
                        </span>
                        <Button size="sm">
                          <Play className="h-3 w-3 mr-1" />
                          Continuer
                        </Button>
                      </div>
                    </div>
                  )}

                  {course.certificate && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <Award className="h-4 w-4" />
                      <span>Certificat obtenu !</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Dernière activité: {course.lastActivity}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Activité de la Semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressData.weeklyActivity.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-sm font-medium">{day.day}</span>
                      <div className="flex-1">
                        <Progress value={(day.hours / 4) * 100} className="h-2 w-24" />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {day.hours}h • {day.lessons} leçons
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">
                  {progressData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0)}h
                </div>
                <div className="text-sm text-muted-foreground">Cette semaine</div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Accomplissements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progressData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${achievement.earned ? 'bg-success/10 border border-success/20' : 'bg-muted/30'
                    }`}
                >
                  <div className={`p-2 rounded-full ${achievement.earned ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${achievement.earned ? 'text-success' : ''}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned ? (
                      <div className="text-xs text-success mt-1">
                        Obtenu le {achievement.date}
                      </div>
                    ) : achievement.progress && (
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-1" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}% complété
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export { ProgressTracking }