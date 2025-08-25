import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Users, Target, Heart, Zap, Globe, Award, BookOpen, Lightbulb } from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Sébastien Lebrun",
      role: "Fondateur & CEO",
      image: "👨🏻‍🦰",
      description: "Fondateur passionné par l'éducation technologique et l'innovation pédagogique."
    },
    {
      name: "Ayari Mohamed Ghassen",
      role: "Ingénieur Informatique",
      image: "🧑🏻‍💻",
      description: "Expert en développement et en création de solutions éducatives innovantes."
    }
  ];

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

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="text-6xl mb-4">{member.image}</div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-semibold">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-center mb-8">Pourquoi les Cours Particuliers ?</h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Notre staff, issu de plusieurs champs disciplinaires tous liés à l'informatique est parti d'un simple constat :
                  Est-ce que les cours d'informatique en groupe sont adaptés à chaque enfant ?
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  La réponse fut unanime : <strong className="text-primary">NON</strong>
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Nous sommes partis d'un sondage sur plusieurs centaines d'enfants :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"J'ai déjà fait des cours en groupe, ce fût une mauvaise expérience, trop de bruit et le professeur n'avait pas assez de temps pour chaque élève"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Moi je suis timide, je ne suis pas à l'aise en groupe"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Mon fils est hyperactif il a tendance à se dissiper dans un groupe"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Ma famille et moi, on voyage tout le temps car mon papa est expatrié"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Je veux faire des cours mais uniquement en duo avec mon frère qui a 2 ans de plus que moi"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Je ne maitrise pas trop bien le français, je veux faire les cours mais en Arabe, et avec une enseignante femme"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"J'ai 11 ans, je suis autiste asperger de haut niveau, et personne ne veut me prendre en classe car j'ai un profil particulier"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"J'ai un quotidien trop chargé, je ne peux pas faire des cours en groupe à horaire fixe"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Je suis un jeune marocain, Mon rêve au-delà des cours de codage est d'échanger avec des enfants de l'Asie de l'Afrique et d'autres continents"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Jeune fille du Nigéria, je ne trouve pas de structure en cours particulier de codage en Anglais"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"J'ai 15ans j'ai pris des cours de codage déjà sur Scratch et maintenant Python, Java et C++ c'était bien mais je ne peux pas avancer à mon rythme, je veux faire des cours particuliers pour accélérer mon cursus car je veux monter ma société rapidement et pouvoir aider ma famille"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"Je suis Belge j'ai 12 ans et je voudrais prendre des cours en duo avec un garçon anglophone, comme ça en plus de coder j'améliore mon anglais"</p>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed text-center">
                  <strong className="text-primary">Ces témoignages ont confirmé notre approche :</strong> Les cours particuliers sont la solution pour répondre aux besoins uniques de chaque enfant.
                </p>
              </div>
            </CardContent>
          </Card>
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