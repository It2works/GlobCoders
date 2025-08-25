import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from '@/lib/cloudinary';
import Header from '@/components/Header';

const Register = () => {
  // Remove useAppData
  // const { addUser } = useAppData();
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    videoFile: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: "student",
      title: "Élève",
      description: "Je veux apprendre le code et l'IA",
      icon: GraduationCap,
      color: "text-primary"
    },
    {
      id: "teacher",
      title: "Formateur",
      description: "Je veux enseigner aux enfants",
      icon: Users,
      color: "text-accent"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!selectedRole) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle",
        variant: "destructive",
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    if (selectedRole === "teacher" && !formData.videoFile) {
      toast({
        title: "Erreur",
        description: "La vidéo de présentation est obligatoire pour les formateurs",
        variant: "destructive",
      });
      return;
    }
    if (!formData.firstName || formData.firstName.length < 2) {
      toast({
        title: "Erreur",
        description: "Le prénom doit contenir au moins 2 caractères",
        variant: "destructive",
      });
      return;
    }
    if (!formData.lastName || formData.lastName.length < 2) {
      toast({
        title: "Erreur",
        description: "Le nom doit contenir au moins 2 caractères",
        variant: "destructive",
      });
      return;
    }
    // Map roles for backend
    const backendRole = selectedRole === "teacher" ? "teacher" : "student";
    setIsLoading(true);
    let presentationVideoUrl = '';
    if (backendRole === 'teacher' && formData.videoFile) {
      try {
        presentationVideoUrl = await uploadToCloudinary(formData.videoFile);
      } catch (err) {
        console.error('Video upload failed:', err);
        toast({
          title: "Erreur d'upload",
          description: "L'upload de la vidéo a échoué. Veuillez réessayer ou contacter le support.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: backendRole,
        presentationVideo: presentationVideoUrl,
      });
      toast({
        title: "Inscription réussie !",
        description: backendRole === "teacher"
          ? "Votre demande de formateur a été envoyée. Veuillez vérifier votre email pour la vérification."
          : "Bienvenue sur GlobCoders ! Vous pouvez maintenant vous connecter.",
      });
      // Redirect to login (if not auto-redirected by AuthContext)
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error?.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
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
              Rejoins l'aventure !
            </h1>
            <p className="text-muted-foreground">
              Crée ton compte et commence à apprendre dès aujourd'hui
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-strong">
            <CardHeader>
              <CardTitle className="text-center">Inscription</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Je suis :</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedRole === role.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                          }`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center`}>
                            <role.icon className={`w-5 h-5 ${role.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{role.title}</div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                          {selectedRole === role.id && (
                            <Badge className="bg-primary/10 text-primary border-primary">
                              Sélectionné
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Ton prénom"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Ton nom"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

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
                      placeholder="Mot de passe sécurisé"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme ton mot de passe"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

                  {/* Teacher-specific field */}
                  {selectedRole === "teacher" && (
                    <div>
                      <Label htmlFor="videoFile" className="flex items-center space-x-2">
                        <span>Vidéo de présentation (obligatoire)</span>
                        <Badge variant="secondary" className="text-xs">Max 180s</Badge>
                      </Label>
                      <div className="mt-1 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
                        <input
                          id="videoFile"
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setFormData(prev => ({ ...prev, videoFile: file }));
                          }}
                          className="hidden"
                          required
                        />
                        <label
                          htmlFor="videoFile"
                          className="cursor-pointer flex flex-col items-center space-y-2 text-center"
                        >
                          {formData.videoFile ? (
                            <div className="text-sm">
                              <div className="font-medium text-primary">{formData.videoFile.name}</div>
                              <div className="text-muted-foreground">
                                {(formData.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="text-sm">
                                <div className="font-medium">Clique pour uploader ta vidéo</div>
                                <div className="text-muted-foreground">Formats acceptés: MP4, MOV, AVI</div>
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Présente-toi en 3 minutes maximum pour convaincre GlobCoders de t'accepter comme formateur.
                        Cette vidéo nous aide à évaluer tes compétences pédagogiques.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={isLoading || !selectedRole || (selectedRole === "teacher" && !formData.videoFile)}
                >
                  {isLoading ? "Inscription..." : "Créer mon compte"}
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Déjà un compte ? </span>
                  <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                    Se connecter
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

export default Register;