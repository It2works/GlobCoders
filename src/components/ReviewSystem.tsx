import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Flag,
  User,
  Calendar,
  Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppData } from "@/hooks/useAppData"

interface ReviewSystemProps {
  courseId?: number
  instructorId?: number
  className?: string
}

const ReviewSystem = ({ courseId, instructorId, className }: ReviewSystemProps) => {
  const { toast } = useToast()
  const { enrollments, loading } = useAppData()
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, comment: "", pros: "", cons: "" })
  const [filter, setFilter] = useState("all") // all, 5star, 4star, etc.

  // Use real data from MongoDB - for now, return empty array since we don't have review model yet
  const reviews: Array<{
    id: string;
    studentName: string;
    studentAvatar: string;
    rating: number;
    date: string;
    comment: string;
    pros: string[];
    cons: string[];
    helpful: number;
    courseCompleted: boolean;
    verifiedPurchase: boolean;
    instructorResponse?: {
      date: string;
      message: string;
    };
  }> = [];

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  const ratingDistribution = {
    5: reviews && Array.isArray(reviews) ? reviews.filter(r => r.rating === 5).length : 0,
    4: reviews && Array.isArray(reviews) ? reviews.filter(r => r.rating === 4).length : 0,
    3: reviews && Array.isArray(reviews) ? reviews.filter(r => r.rating === 3).length : 0,
    2: reviews && Array.isArray(reviews) ? reviews.filter(r => r.rating === 2).length : 0,
    1: reviews && Array.isArray(reviews) ? reviews.filter(r => r.rating === 1).length : 0,
  }

  const filteredReviews = filter === "all"
    ? (reviews && Array.isArray(reviews) ? reviews : [])
    : (reviews && Array.isArray(reviews) ? reviews.filter(review => review.rating === parseInt(filter.replace('star', ''))) : [])

  const submitReview = () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez donner une note et écrire un commentaire",
        variant: "destructive"
      })
      return
    }

    // In real app, submit to API
    toast({
      title: "Avis publié !",
      description: "Merci pour votre retour, il aide les autres étudiants"
    })
    setIsReviewModalOpen(false)
    setNewReview({ rating: 0, comment: "", pros: "", cons: "" })
  }

  const markHelpful = (reviewId: string) => {
    toast({
      title: "Merci !",
      description: "Votre retour a été pris en compte"
    })
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Avis et Évaluations ({reviews.length})
            </CardTitle>
            <Button onClick={() => setIsReviewModalOpen(true)}>
              Laisser un avis
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Rating Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(averageRating)
                      ? 'text-warning fill-warning'
                      : 'text-muted-foreground'
                      }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Basé sur {reviews.length} avis
              </div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <Star className="h-3 w-3 text-warning" />
                    <span className="text-sm">{rating}</span>
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-warning h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Tous les avis
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filter === `${rating}star` ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(`${rating}star`)}
                disabled={ratingDistribution[rating as keyof typeof ratingDistribution] === 0}
              >
                {rating} ⭐ ({ratingDistribution[rating as keyof typeof ratingDistribution]})
              </Button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-medium text-primary">
                    {review.studentAvatar}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.studentName}</span>
                          {review.verifiedPurchase && (
                            <Badge variant="secondary" className="text-xs">
                              Achat vérifié
                            </Badge>
                          )}
                          {review.courseCompleted && (
                            <Badge variant="outline" className="text-xs border-success text-success">
                              Cours terminé
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating
                                  ? 'text-warning fill-warning'
                                  : 'text-muted-foreground'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground">{review.comment}</p>

                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-success mb-2">👍 Points positifs</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-warning mb-2">👎 Points d'amélioration</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {review.instructorResponse && (
                      <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Réponse du formateur</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.instructorResponse.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.instructorResponse.message}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpful(review.id)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Utile ({review.helpful})
                      </Button>

                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Répondre
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Laisser un avis</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Note générale *</label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${i < newReview.rating
                        ? 'text-warning fill-warning'
                        : 'text-muted-foreground hover:text-warning'
                        }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {newReview.rating > 0 ? `${newReview.rating}/5` : "Cliquez pour noter"}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Votre commentaire *</label>
              <Textarea
                placeholder="Partagez votre expérience avec ce cours..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Points positifs</label>
                <Textarea
                  placeholder="Ce qui vous a plu..."
                  value={newReview.pros}
                  onChange={(e) => setNewReview(prev => ({ ...prev, pros: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Points d'amélioration</label>
                <Textarea
                  placeholder="Ce qui pourrait être amélioré..."
                  value={newReview.cons}
                  onChange={(e) => setNewReview(prev => ({ ...prev, cons: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={submitReview}>
                Publier l'avis
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { ReviewSystem }