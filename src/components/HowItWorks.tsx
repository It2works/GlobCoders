import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Trophy, Zap } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Users,
      title: "Choisis ton formateur",
      description: "Sélectionne parmi nos formateurs qualifiés celui qui correspond à tes besoins et à ton style d'apprentissage.",
      color: "text-primary"
    },
    {
      icon: BookOpen,
      title: "Cours personnalisés",
      description: "Apprends à ton rythme avec des cours adaptés à ton âge et à ton niveau de programmation.",
      color: "text-accent"
    },
    {
      icon: Zap,
      title: "Pratique interactive",
      description: "Code en temps réel, résous des défis et crée tes propres projets avec l'aide de ton formateur.",
      color: "text-success"
    },
    {
      icon: Trophy,
      title: "Gagne des certificats",
      description: "Obtiens des certificats numériques pour valider tes compétences et montrer tes progrès.",
      color: "text-warning"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-muted to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Comment ça{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              fonctionne
            </span>{" "}
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            En seulement 4 étapes simples, commence ton aventure dans le monde du code et de l'IA !
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-8 text-center">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connection lines for larger screens */}
        <div className="hidden lg:block relative -mt-32 mb-16">
          <div className="absolute top-1/2 left-1/4 w-1/4 h-px bg-gradient-to-r from-primary/50 to-accent/50"></div>
          <div className="absolute top-1/2 left-2/4 w-1/4 h-px bg-gradient-to-r from-accent/50 to-success/50"></div>
          <div className="absolute top-1/2 left-3/4 w-1/4 h-px bg-gradient-to-r from-success/50 to-warning/50"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;