import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/";

    switch (user.role) {
      case 'admin':
        return user.adminCertificate?.verified ? '/admin-dashboard' : '/admin-certificate';
      case 'teacher':
        return user.teacherApprovalStatus === 'approved' ? '/teacher-dashboard' : '/teacher-pending-approval';
      case 'student':
        return '/dashboard';
      default:
        return '/';
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary-light to-secondary overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-primary-light rounded-full text-primary font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Plateforme éducative #1 pour enfants
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Apprends le{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                code
              </span>{" "}
              et l'
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                IA
              </span>{" "}
              en t'amusant !
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Découvre le monde magique de la programmation et de l'intelligence artificielle avec nos cours interactifs et nos formateurs passionnés.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!isAuthenticated ? (
                <Button variant="hero" size="xl" asChild>
                  <Link to="/register">
                    Commencer gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button variant="hero" size="xl" asChild>
                  <Link to={getDashboardPath()}>
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Accéder au tableau de bord
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="xl" className="group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Voir la démo
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-strong">
              <img
                src="/lovable-uploads/LOGO Globcoders.png"
                alt="GlobCoders Robot"
                className="w-full h-auto max-w-md mx-auto drop-shadow-2xl"
              />

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-accent text-white p-3 rounded-xl shadow-lg animate-bounce">
                <div className="text-xs font-semibold">Python</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-success text-white p-3 rounded-xl shadow-lg animate-bounce delay-200">
                <div className="text-xs font-semibold">JavaScript</div>
              </div>
              <div className="absolute top-1/2 -left-8 bg-primary text-white p-3 rounded-xl shadow-lg animate-bounce delay-400">
                <div className="text-xs font-semibold">IA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;