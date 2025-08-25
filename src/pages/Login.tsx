import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      // Success: navigation is handled by AuthContext
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error?.message || "Email ou mot de passe incorrect",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light to-secondary">
      <Header />

      <div className="flex items-center justify-center p-4 pt-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Content de te revoir !
            </h1>
            <p className="text-muted-foreground">
              Connecte-toi pour continuer ton aventure
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-strong">
            <CardHeader>
              <CardTitle className="text-center">Connexion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ton@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ton mot de passe"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-center text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-muted-foreground">Se souvenir de moi</span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Pas encore de compte ? </span>
                  <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                    S'inscrire gratuitement
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
};

export default Login;