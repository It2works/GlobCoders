import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import CourseEnrollmentModal from '@/components/CourseEnrollmentModal';
import {
  Search,
  Code,
  Brain,
  Database,
  BookOpen,
  Clock,
  Star,
  User,
  Palette,
  TrendingUp,
  Music,
  Camera,
  ChefHat,
  Dumbbell,
  Globe,
  Sparkles
} from 'lucide-react';

const Courses = () => {
  const { courses, enrollments, fetchEnrollments } = useAppData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingState, setBookingState] = useState<{ isOpen: boolean; course: any | null }>({ isOpen: false, course: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  // Filter available courses (not enrolled)
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
  const enrolledCourseIds = user
    ? safeEnrollments
      .filter(e => e.student === user._id)
      .map(e => e.course._id)
    : [];

  const safeCourses = Array.isArray(courses) ? courses : [];

  // Apply filters
  const filteredCourses = safeCourses.filter(course => {
    // Search filter
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && course.category !== selectedCategory) {
      return false;
    }

    // Level filter
    if (selectedLevel !== 'all' && course.level !== selectedLevel) {
      return false;
    }

    // Price filter
    if (priceFilter === 'free' && course.price !== 0) {
      return false;
    }
    if (priceFilter === 'paid' && course.price === 0) {
      return false;
    }

    return true;
  });

  const availableCourses = filteredCourses.filter(course =>
    !enrolledCourseIds.includes(course._id)
  );

  // Dynamic categories with real counts from database
  const categories = useMemo(() => {
    const categoryData = [
      { key: 'programming', name: 'Programmation', icon: Code, color: 'from-blue-500 to-cyan-500' },
      { key: 'design', name: 'Design & Créativité', icon: Palette, color: 'from-purple-500 to-pink-500' },
      { key: 'business', name: 'Business & Marketing', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
      { key: 'marketing', name: 'Marketing Digital', icon: Brain, color: 'from-orange-500 to-red-500' },
      { key: 'music', name: 'Musique & Audio', icon: Music, color: 'from-yellow-500 to-orange-500' },
      { key: 'photography', name: 'Photographie', icon: Camera, color: 'from-indigo-500 to-purple-500' },
      { key: 'cooking', name: 'Cuisine', icon: ChefHat, color: 'from-red-500 to-pink-500' },
      { key: 'fitness', name: 'Fitness & Santé', icon: Dumbbell, color: 'from-teal-500 to-green-500' },
      { key: 'language', name: 'Langues', icon: Globe, color: 'from-amber-500 to-yellow-500' },
      { key: 'other', name: 'Autres', icon: Sparkles, color: 'from-gray-500 to-slate-500' }
    ];

    return categoryData.map(cat => ({
      ...cat,
      count: safeCourses.filter(course => course.category === cat.key).length
    })).filter(cat => cat.count > 0); // Only show categories with courses
  }, [safeCourses]);

  const openBooking = (course: any) => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour vous inscrire à un cours',
        variant: 'destructive'
      });
      return;
    }
    setBookingState({ isOpen: true, course });
  };

  const handleBookingClose = () => {
    setBookingState({ isOpen: false, course: null });
  };

  const handleEnrollmentSuccess = async () => {
    toast({ title: 'Inscription réussie !', description: 'Vos sessions ont été planifiées.' });
    setBookingState({ isOpen: false, course: null });
    try { await fetchEnrollments(); } catch { }
  };

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(categoryKey === selectedCategory ? 'all' : categoryKey);
  };

  const totalCourses = safeCourses.length;
  const totalEnrollments = safeEnrollments.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {totalCourses} cours disponibles
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-4">
            Découvrez Nos Cours
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Apprenez avec des experts, progressez à votre rythme et développez vos compétences avec nos cours interactifs
          </p>
        </div>

        {/* Enhanced Search and Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🔍 Recherche et Filtres</h3>
            <p className="text-sm text-gray-600">Trouvez le cours parfait selon vos besoins</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher un cours par titre, description ou instructeur..."
              className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Level Filters */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📚 Niveau de difficulté</h4>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedLevel === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('all')}
                className={`h-11 px-6 rounded-lg font-medium transition-all duration-200 ${selectedLevel === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                  : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
              >
                🌟 Tous les niveaux
              </Button>
              <Button
                variant={selectedLevel === 'beginner' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('beginner')}
                className={`h-11 px-6 rounded-lg font-medium transition-all duration-200 ${selectedLevel === 'beginner'
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                  : 'hover:bg-green-50 hover:border-green-300'
                  }`}
              >
                🌱 Débutant
              </Button>
              <Button
                variant={selectedLevel === 'intermediate' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('intermediate')}
                className={`h-11 px-6 rounded-lg font-medium transition-all duration-200 ${selectedLevel === 'intermediate'
                  ? 'bg-yellow-600 hover:bg-yellow-700 shadow-lg'
                  : 'hover:bg-yellow-50 hover:border-yellow-300'
                  }`}
              >
                ⚡ Intermédiaire
              </Button>
              <Button
                variant={selectedLevel === 'advanced' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('advanced')}
                className={`h-11 px-6 rounded-lg font-medium transition-all duration-200 ${selectedLevel === 'advanced'
                  ? 'bg-red-600 hover:bg-red-700 shadow-lg'
                  : 'hover:bg-red-50 hover:border-red-300'
                  }`}
              >
                🚀 Avancé
              </Button>
            </div>
          </div>

          {/* Price and Category Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">💰 Prix</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={priceFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setPriceFilter('all')}
                  className={`h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${priceFilter === 'all'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-lg'
                    : 'hover:bg-purple-50 hover:border-purple-300'
                    }`}
                >
                  💎 Tous les prix
                </Button>
                <Button
                  variant={priceFilter === 'free' ? 'default' : 'outline'}
                  onClick={() => setPriceFilter('free')}
                  className={`h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${priceFilter === 'free'
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                    : 'hover:bg-green-50 hover:border-green-300'
                    }`}
                >
                  🆓 Gratuit
                </Button>
                <Button
                  variant={priceFilter === 'paid' ? 'default' : 'outline'}
                  onClick={() => setPriceFilter('paid')}
                  className={`h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${priceFilter === 'paid'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                    : 'hover:bg-blue-50 hover:border-blue-300'
                    }`}
                >
                  💳 Payant
                </Button>
              </div>
            </div>

            {/* Dynamic Category Quick Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">🏷️ Catégorie rapide</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className={`h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === 'all'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'
                    : 'hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                >
                  Toutes
                </Button>
                {/* Dynamic categories from database */}
                {categories.slice(0, 4).map((category) => (
                  <Button
                    key={category.key}
                    variant={selectedCategory === category.key ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === category.key
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                      : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                  >
                    {category.icon && <category.icon className="h-4 w-4 mr-2" />}
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Active Filters Display */}
        {(selectedCategory !== 'all' || selectedLevel !== 'all' || priceFilter !== 'all' || searchQuery) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-blue-600 font-medium">🎯 Filtres actifs</span>
              <span className="text-sm text-blue-500">({[
                selectedCategory !== 'all' ? 1 : 0,
                selectedLevel !== 'all' ? 1 : 0,
                priceFilter !== 'all' ? 1 : 0,
                searchQuery ? 1 : 0
              ].reduce((a, b) => a + b, 0)} appliqué{[
                selectedCategory !== 'all' ? 1 : 0,
                selectedLevel !== 'all' ? 1 : 0,
                priceFilter !== 'all' ? 1 : 0,
                searchQuery ? 1 : 0
              ].reduce((a, b) => a + b, 0) > 1 ? 's' : ''})</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 px-3 py-1 rounded-full font-medium"
                  onClick={() => setSelectedCategory('all')}
                >
                  🏷️ {categories.find(c => c.key === selectedCategory)?.name} ×
                </Badge>
              )}
              {selectedLevel !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200 border border-green-300 px-3 py-1 rounded-full font-medium"
                  onClick={() => setSelectedLevel('all')}
                >
                  📚 {selectedLevel === 'beginner' ? 'Débutant' : selectedLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé'} ×
                </Badge>
              )}
              {priceFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 px-3 py-1 rounded-full font-medium"
                  onClick={() => setPriceFilter('all')}
                >
                  💰 {priceFilter === 'free' ? 'Gratuit' : 'Payant'} ×
                </Badge>
              )}
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300 px-3 py-1 rounded-full font-medium"
                  onClick={() => setSearchQuery('')}
                >
                  🔍 "{searchQuery}" ×
                </Badge>
              )}

              {/* Clear All Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setPriceFilter('all');
                  setSearchQuery('');
                }}
                className="ml-2 h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                🗑️ Effacer tout
              </Button>
            </div>
          </div>
        )}

        {/* Course Results */}
        {availableCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-bold mb-4">Aucun cours trouvé</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || priceFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche ou de réinitialiser les filtres'
                : 'Aucun cours disponible pour le moment. Revenez plus tard !'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || priceFilter !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setPriceFilter('all');
                }}
              >
                Réinitialiser tous les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {availableCourses.length} cours trouvé{availableCourses.length > 1 ? 's' : ''}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || priceFilter !== 'all'
                  ? 'Résultats filtrés'
                  : 'Tous les cours disponibles'
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-muted/30 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-2">
                        📚
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={course.price === 0 ? "secondary" : "default"} className="text-xs">
                          {course.price === 0 ? "Gratuit" : `${course.price}€`}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.round(course.duration.total / 60)}h {course.duration.total % 60}min
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {course.enrollmentCount} étudiant{course.enrollmentCount > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{course.rating.average.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({course.rating.count})</span>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <div className="font-medium">Par {course.instructor.firstName} {course.instructor.lastName}</div>
                        <div className="text-xs capitalize">{course.level}</div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 h-11"
                      onClick={() => openBooking(course)}
                    >
                      S'inscrire au cours
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-20 p-12 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl border border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer votre aventure ?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'apprenants qui développent déjà leurs compétences avec nos cours !
          </p>
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white h-12 px-8 text-lg">
            Commencer maintenant
          </Button>
        </div>
      </div>

      {/* Course Enrollment Modal */}
      {bookingState.course && (
        <CourseEnrollmentModal
          isOpen={bookingState.isOpen}
          onClose={handleBookingClose}
          course={bookingState.course}
          onEnrollmentSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
};

export default Courses;