import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Target,
  CheckCircle,
  Play,
  Lock,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { Course } from "@/services/types"

interface CoursePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  course: Course | null
  onEnroll: () => void
}

interface CoursePreviewData {
  overview: {
    description: string
    objectives: string[]
    prerequisites: string[]
  }
  curriculum: Array<{
    module: string
    lessons: number
    duration: string
    preview: boolean
    topics: string[]
  }>
  instructor: {
    name: string
    rating: number
    students: number
    courses: number
    bio: string
  }
  reviews: Array<{
    student: string
    rating: number
    comment: string
    date: string
  }>
}

const CoursePreviewModal = ({ isOpen, onClose, course, onEnroll }: CoursePreviewModalProps) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<CoursePreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real course preview data from API
  const fetchCoursePreview = async () => {
    if (!course) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/courses/${course._id}/preview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch course preview')
      }

      const data = await response.json()
      setPreviewData(data)
    } catch (err) {
      console.error('Error fetching course preview:', err)
      setError('Failed to load course preview')

      // Set default data as fallback for production
      setPreviewData({
        overview: {
          description: course.description || "Aucune description disponible pour le moment.",
          objectives: ["Objectifs du cours en cours de chargement..."],
          prerequisites: ["Prérequis en cours de chargement..."]
        },
        curriculum: [],
        instructor: {
          name: course.teacher || "Formateur",
          rating: 0,
          students: 0,
          courses: 0,
          bio: "Informations du formateur en cours de chargement..."
        },
        reviews: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && course) {
      fetchCoursePreview()
    }
  }, [isOpen, course])

  if (!course) return null

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement de l'aperçu du cours...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchCoursePreview} variant="outline">
              Réessayer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!previewData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune donnée d'aperçu disponible</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{course.title}</DialogTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration || "Durée non spécifiée"}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.students || 0} élèves
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning" />
                  {course.rating || 0}
                </div>
                <Badge variant="outline">{course.level || "Niveau non spécifié"}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{course.price || "Gratuit"}</div>
              <Button onClick={onEnroll} className="mt-2">
                S'inscrire maintenant
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="curriculum">Programme</TabsTrigger>
            <TabsTrigger value="instructor">Formateur</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {previewData.overview.description}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Objectifs d'apprentissage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {previewData.overview.objectives.map((objective, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Prérequis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {previewData.overview.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Programme du cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewData.curriculum.length > 0 ? (
                  <div className="space-y-4">
                    {previewData.curriculum.map((module, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{module.module}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{module.lessons} leçons</span>
                            <span>•</span>
                            <span>{module.duration}</span>
                            {module.preview && (
                              <Badge variant="secondary">Aperçu</Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {module.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-center gap-2 text-sm">
                              {module.preview ? (
                                <Play className="h-3 w-3 text-green-500" />
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className={module.preview ? "" : "text-muted-foreground"}>
                                {topic}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Programme du cours en cours de préparation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  À propos du formateur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{previewData.instructor.name}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-warning fill-current" />
                        {previewData.instructor.rating}/5
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{previewData.instructor.students}</div>
                          <div className="text-muted-foreground">Élèves</div>
                        </div>
                        <div>
                          <div className="font-medium">{previewData.instructor.courses}</div>
                          <div className="text-muted-foreground">Cours</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {previewData.instructor.bio}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Avis des élèves
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {previewData.reviews.map((review, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.student}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating
                                      ? "text-warning fill-current"
                                      : "text-muted-foreground"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun avis disponible pour le moment</p>
                    <p className="text-sm mt-1">Soyez le premier à laisser un avis !</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default CoursePreviewModal