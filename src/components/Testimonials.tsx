import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Emma, 12 ans",
      course: "Python pour débutants",
      rating: 5,
      comment: "J'adore apprendre avec GlobCoders ! Mon formateur est super patient et j'ai déjà créé mon premier jeu en Python. Mes parents sont fiers de moi ! 🎮",
      avatar: "👧"
    },
    {
      name: "Lucas, 14 ans",
      course: "Intelligence Artificielle",
      rating: 5,
      comment: "Les cours d'IA sont incroyables ! J'ai appris comment les robots pensent et j'ai même créé mon propre chatbot. C'est magique ! 🤖",
      avatar: "👦"
    },
    {
      name: "Zoé, 11 ans",
      course: "JavaScript & Web",
      rating: 5,
      comment: "Maintenant je peux créer mes propres sites web ! Mes amis n'en reviennent pas. Merci GlobCoders pour ces cours géniaux ! 💻",
      avatar: "👧"
    },
    {
      name: "Théo, 13 ans",
      course: "Data Science",
      rating: 5,
      comment: "J'ai découvert comment analyser les données comme un vrai scientifique ! C'est passionnant de voir les graphiques que je crée. 📊",
      avatar: "👦"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-primary-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Ce que disent nos{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              petits génies
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvre les témoignages de nos jeunes développeurs qui ont déjà commencé leur aventure !
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Quote icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-8 h-8 text-primary/30 group-hover:text-primary/50 transition-colors" />
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-foreground mb-6 leading-relaxed font-medium">
                  "{testimonial.comment}"
                </p>

                {/* Author info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-light to-secondary rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.course}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-success/10 rounded-full text-success font-medium">
            <span className="mr-2">🎉</span>
            Plus de 500 jeunes développeurs nous font confiance !
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;