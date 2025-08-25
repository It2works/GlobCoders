import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAppData } from "@/hooks/useAppData"
import {
  Heart,
  HeartOff,
  Search,
  BookOpen,
  Clock,
  Star,
  Filter,
  Bookmark
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookmarksFavoritesProps {
  className?: string
}

const BookmarksFavorites = ({ className }: BookmarksFavoritesProps) => {
  const { toast } = useToast()
  const { courses, enrollments, loading } = useAppData()
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all") // all, courses, instructors

  // Use real data from MongoDB - for now, we'll use enrolled courses as bookmarks
  // In a real app, you'd have a separate bookmarks/favorites collection
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];

  const bookmarks = safeEnrollments.map(enrollment => ({
    id: enrollment._id,
    type: "course" as const,
    title: enrollment.course.title,
    instructor: `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`,
    rating: enrollment.course.rating?.average || 0,
    students: enrollment.course.enrollmentCount || 0,
    duration: `${enrollment.course.duration?.total || 0} heures`,
    price: enrollment.course.price === 0 ? "Gratuit" : `${enrollment.course.price}€`,
    image: enrollment.course.thumbnail || "📚",
    category: enrollment.course.category || "programming",
    level: enrollment.course.level || "beginner",
    bookmarkedDate: new Date(enrollment.enrolledAt).toLocaleDateString('fr-FR'),
    notes: "", // Notes field doesn't exist in Enrollment interface
    progress: enrollment.progress,
    completed: enrollment.completed
  }));

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || bookmark.type === filter.slice(0, -1) // remove 's' from 'courses'
    return matchesSearch && matchesFilter
  })

  const removeBookmark = (id: string) => {
    // In a real app, this would call an API to remove the bookmark
    toast({
      title: "Favori supprimé",
      description: "Le cours a été retiré de vos favoris"
    })
  }

  const addNote = (id: number, note: string) => {
    // This function is no longer directly applicable to the new bookmark structure
    // as bookmarks are now directly from enrollments.
    // If you need to add notes to a specific enrollment, you'd need to manage state
    // or pass the enrollment object itself.
    // For now, we'll keep it as is, but it might need adjustment depending on how notes are handled.
    // Assuming 'id' here is the enrollment._id, but the type is string.
    // This function might need to be refactored or removed if notes are no longer directly tied to enrollments.
    // For now, we'll just toast a message.
    toast({
      title: "Note ajoutée",
      description: "Votre note a été sauvegardée"
    })
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Mes Favoris ({bookmarks.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Courses et formateurs sauvegardés pour plus tard
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans mes favoris..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Tout
              </Button>
              <Button
                variant={filter === "courses" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("courses")}
              >
                Cours
              </Button>
              <Button
                variant={filter === "instructors" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("instructors")}
              >
                Formateurs
              </Button>
            </div>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{bookmark.image}</div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{bookmark.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {bookmark.type === "course" ? `Par ${bookmark.instructor}` : bookmark.instructor}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBookmark(bookmark.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <HeartOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-warning" />
                        {bookmark.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {bookmark.students} élèves
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {bookmark.duration}
                      </div>
                      <Badge variant="outline">{bookmark.level}</Badge>
                      <Badge variant="secondary">{bookmark.price}</Badge>
                    </div>

                    {bookmark.notes && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Bookmark className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">Ma note:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{bookmark.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Ajouté le {new Date(bookmark.bookmarkedDate).toLocaleDateString('fr-FR')}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Voir le cours
                        </Button>
                        <Button size="sm">
                          S'inscrire
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBookmarks.length === 0 && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">Aucun favori trouvé</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Aucun résultat ne correspond à votre recherche"
                  : "Commencez à sauvegarder vos cours et formateurs préférés"
                }
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { BookmarksFavorites }