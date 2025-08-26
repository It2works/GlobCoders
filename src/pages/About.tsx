import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Users, Target, Heart, Zap, Globe, Award, BookOpen, Lightbulb, Github } from "lucide-react";

const About = () => {
  const developer = {
    name: "Ayari Mohamed Ghassen",
    role: "Développeur Créateur",
    image: "🧑🏻‍💻",
    description: "Développeur créateur de cette plateforme GlobCoders. Passionné par le développement web et les solutions éducatives innovantes.",
    github: "https://github.com/It2works"
  };

  const values = [
    {
      icon: Heart,
      title: "Passion",
      description: "Nous croyons que l'apprentissage doit être amusant et passionnant pour tous les enfants."
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque cours, chaque interaction et chaque expérience."
    },
    {
      icon: Globe,
      title: "Accessibilité",
      description: "Nous rendons l'apprentissage du code accessible à tous, peu importe leur origine."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Nous innovons constamment pour offrir les meilleures méthodes d'apprentissage."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Élèves formés", icon: Users },
    { number: "500+", label: "Heures de cours", icon: BookOpen },
    { number: "95%", label: "Taux de satisfaction", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            À propos de GlobCoders
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Nous sommes une plateforme éducative innovante qui a révolutionné l'apprentissage du code pour les enfants
            en remplaçant les cours en groupe par des cours particuliers personnalisés. Notre approche unique s'adapte
            à chaque profil d'enfant, respectant leur rythme, leur culture et leurs besoins spécifiques.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl text-center font-bold mb-6">Notre Équipe Pédagogique</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Notre équipe est mixte et comme nous l'avons précisé, s'adapte au profil de l'apprenant.
                  Chacun de nos enseignants intègre notre plate-forme après un long processus de recrutement.
                </p>
                <p>
                  Même si nous savons que tous, sont passionnés par l'informatique, cela ne suffit pas, nous sommes conscients que l'apprentissage du codage aux enfants nécessitent des profils particuliers et riches en pédagogie.
                </p>
                <p>
                  L'apprentissage du codage peut être long et difficile, notre enseignant outre ses compétences techniques, est sélectionné pour son écoute active, sa patience, et sa persévérance pour aider les enfants à surmonter les obstacles.
                </p>
                <p>
                  Grace au cours particulier, il peut prendre le temps de s'adapter à chaque profil, et orienter sa méthode en fonction des acquis de l'enfant.
                </p>
                <p>
                  Outre, sa transmission de l'informatique notre professeur se doit aussi d'être disponible pour les familles de ses apprentis codeurs et répondre à leurs attentes si besoin.
                </p>
                <p>
                  Dans un gage de qualité, un audit est réalisé mensuellement en temps réel pour chaque enseignant.
                </p>
              </div>

            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <div className="text-8xl">🚀</div>
              </div>
            </div>
          </div>
        </div>


        {/* Personalized Learning Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-center mb-8">L'Apprentissage Personnalisé</h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Globcoders t'offre à travers les cours particuliers, un environnement d'apprentissage personnalisé.
                  Saches que, dans un souci de qualité et d'éthique, nous adaptons nos cours à ton origine, à ta culture et aussi à ta langue, puisque nos cours sont dispensés en français, anglais et arabe.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Flexibilité Totale</h3>
                    <p className="text-muted-foreground">
                      Les cours particuliers seront plus flexibles pour toi en termes d'horaires et de lieu, s'adaptant à tes contraintes et à ta scolarité.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Enseignement Adapté</h3>
                    <p className="text-muted-foreground">
                      Un(e) enseignant(e) qualifié(e) va adapter son enseignement en fonction de ton rythme et de tes capacités, tu te sentiras alors plus soutenu et encouragé.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Progression Accélérée</h3>
                    <p className="text-muted-foreground">
                      Notre cursus se concentre sur des sujets spécifiques pertinents pour les objectifs de chaque enfant, ce qui accélère le processus d'apprentissage.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Environnement Optimisé</h3>
                    <p className="text-muted-foreground">
                      Par un environnement offrant moins de distraction qu'un groupe, le temps est optimisé, les séances individuelles permettent donc un accompagnement personnalisé.
                    </p>
                  </div>
                </div>

                <div className="bg-white/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary mb-4">Projets et Certification</h3>
                  <p className="text-muted-foreground mb-4">
                    Comme chacun de nos apprentis codeurs, tu définiras ton projet en collaboration avec ton enseignant(e) pour chacune de tes années à nos côtés, tu présenteras alors ton travail à tes paires et une certification reconnue te sera remise à chaque fin de cycle.
                  </p>
                  <p className="text-muted-foreground">
                    Afin de garder un lien étroit avec ta communauté notre forum Globcoders est là pour te permettre d'échanger et de présenter tes travaux avec des enfants du monde entier.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Suivi Régulier</h3>
                    <p className="text-muted-foreground">
                      Chaque fin de mois, un bilan pédagogique complet sera remis à tes parents et nous pourrons échanger sur tes pratiques.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Réseau Professionnel</h3>
                    <p className="text-muted-foreground">
                      Les cours particuliers peuvent parfois donner accès à un réseau professionnel dans le domaine de l'informatique, ce qui peut être très utile pour ton avenir.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Developer Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Le Développeur</h2>
          <div className="flex justify-center">
            <div className="max-w-md">
              <Card className="text-center bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="text-6xl mb-4">{developer.image}</div>
                  <CardTitle className="text-xl">{developer.name}</CardTitle>
                  <CardDescription className="text-primary font-semibold text-base">
                    {developer.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{developer.description}</p>
                  <div className="flex justify-center">
                    <a
                      href={developer.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span className="text-sm font-medium">GitHub Profile</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>



        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Rejoignez l'Aventure GlobCoders</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Prêt à faire partie de la communauté qui forme les développeurs de demain ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline">
              Devenir formateur
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;