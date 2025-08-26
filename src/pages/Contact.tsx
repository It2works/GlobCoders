import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Mail, Phone, Clock, MessageCircle, HelpCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une question ? Besoin d'aide ? Notre équipe est là pour vous accompagner !
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Email Card */}
          <Card className="text-center bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-primary font-medium mb-1">contact@globcoders.com</p>
              <p className="text-sm text-muted-foreground">Nous répondons sous 24h</p>
            </CardContent>
          </Card>



          {/* Hours Card */}
          <Card className="text-center bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Horaires</h3>
              <p className="text-primary font-medium mb-1">Lun-Ven: 9h-18h</p>
              <p className="text-sm text-muted-foreground">Support disponible</p>
            </CardContent>
          </Card>

          {/* Message Circle Card */}
          <Card className="text-center bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Besoin d'aide ?</h3>
              <p className="text-primary font-medium mb-1">Contactez-nous</p>
              <p className="text-sm text-muted-foreground">Notre équipe est là pour vous écouter.</p>
            </CardContent>
          </Card>
        </div>

        {/* Real Student Needs Section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Les Vrais Besoins des Enfants
              </CardTitle>
              <CardDescription>
                Découvrez pourquoi nous avons choisi les cours particuliers grâce à notre enquête auprès de centaines d'enfants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Notre staff, issu de plusieurs champs disciplinaires tous liés à l'informatique est parti d'un simple constat :
                  <strong className="text-primary"> Est-ce que les cours d'informatique en groupe sont adaptés à chaque enfant ?</strong>
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  La réponse fut unanime : <strong className="text-primary text-xl">NON</strong>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm text-muted-foreground italic">"J'ai déjà fait des cours en groupe, ce fût une mauvaise expérience, trop de bruit et le professeur n'avait pas assez de temps pour chaque élève"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-accent">
                    <p className="text-sm text-muted-foreground italic">"Moi je suis timide, je ne suis pas à l'aise en groupe"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm text-muted-foreground italic">"Mon fils est hyperactif il a tendance à se dissiper dans un groupe"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-accent">
                    <p className="text-sm text-muted-foreground italic">"Ma famille et moi, on voyage tout le temps car mon papa est expatrié"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm text-muted-foreground italic">"Je veux faire des cours mais uniquement en duo avec mon frère qui a 2 ans de plus que moi"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-accent">
                    <p className="text-sm text-muted-foreground italic">"Je ne maitrise pas trop bien le français, je veux faire les cours mais en Arabe, et avec une enseignante femme"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm text-muted-foreground italic">"J'ai 11 ans, je suis autiste asperger de haut niveau, et personne ne veut me prendre en classe car j'ai un profil particulier"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-accent">
                    <p className="text-sm text-muted-foreground italic">"J'ai un quotidien trop chargé, je ne peux pas faire des cours en groupe à horaire fixe"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm text-muted-foreground italic">"Je suis un jeune marocain, Mon rêve au-delà des cours de codage est d'échanger avec des enfants de l'Asie de l'Afrique et d'autres continents"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-accent">
                    <p className="text-sm text-muted-foreground italic">"Jeune fille du Nigéria, je ne trouve pas de structure en cours particulier de codage en Anglais"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm text-muted-foreground italic">"J'ai 15ans j'ai pris des cours de codage déjà sur Scratch et maintenant Python, Java et C++ c'était bien mais je ne peux pas avancer à mon rythme, je veux faire des cours particuliers pour accélérer mon cursus car je veux monter ma société rapidement et pouvoir aider ma famille"</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border-l-4 border-accent">
                    <p className="text-sm text-muted-foreground italic">"Je suis Belge j'ai 12 ans et je voudrais prendre des cours en duo avec un garçon anglophone, comme ça en plus de coder j'améliore mon anglais"</p>
                  </div>
                </div>

                <div className="text-center bg-primary/10 p-6 rounded-lg">
                  <p className="text-lg text-primary font-semibold">
                    Ces témoignages ont confirmé notre approche : Les cours particuliers sont la solution pour répondre aux besoins uniques de chaque enfant.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Prêt à commencer l'aventure ?</h2>
          <p className="text-muted-foreground mb-6">
            Inscrivez votre enfant dès aujourd'hui et offrez-lui les clés du futur !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
                Inscription gratuite
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;