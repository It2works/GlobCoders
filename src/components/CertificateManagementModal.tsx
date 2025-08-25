import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Award, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { User, Course } from "@/services/types";

interface Certificate {
  _id: string;
  studentId: string;
  courseId: string;
  status: 'En attente' | 'Validé' | 'Rejeté';
  issuedDate: Date;
  validationDate?: Date;
  certificateNumber?: string;
  grade: number;
}

interface CertificateManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  users: User[];
  courses: Course[];
}

const CertificateManagementModal = ({ open, onOpenChange, trigger, users, courses }: CertificateManagementModalProps) => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Ensure data is arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeCourses = Array.isArray(courses) ? courses : [];

  // Fetch real certificates data from API
  const fetchCertificates = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/certificates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to load certificates');
      setCertificates([]); // Set empty array as fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCertificates();
    }
  }, [open]);

  const handleValidate = async (certificate: Certificate) => {
    try {
      const response = await fetch(`/api/admin/certificates/${certificate._id}/validate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Validé',
          validationDate: new Date(),
          certificateNumber: `GC-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, '0')}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to validate certificate');
      }

      const updatedCertificate = await response.json();
      
      setCertificates(prev =>
        prev.map(c => c._id === certificate._id ? updatedCertificate : c)
      );

      toast({
        title: "Certificat validé",
        description: `Le certificat a été validé avec le numéro ${updatedCertificate.certificateNumber}`,
      });
    } catch (err) {
      console.error('Error validating certificate:', err);
      toast({
        title: "Erreur",
        description: "Impossible de valider le certificat",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (certificate: Certificate) => {
    try {
      const response = await fetch(`/api/admin/certificates/${certificate._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Rejeté'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject certificate');
      }

      const updatedCertificate = await response.json();
      
      setCertificates(prev =>
        prev.map(c => c._id === certificate._id ? updatedCertificate : c)
      );

      toast({
        title: "Certificat rejeté",
        description: "Le certificat a été rejeté",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Error rejecting certificate:', err);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le certificat",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    fetchCertificates(true);
  };

  const getStudent = (studentId: string) => {
    return safeUsers.find(u => u._id === studentId);
  };

  const getCourse = (courseId: string) => {
    return safeCourses.find(c => c._id === courseId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'default';
      case 'En attente': return 'secondary';
      case 'Rejeté': return 'destructive';
      default: return 'secondary';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const pendingCount = certificates.filter(c => c.status === 'En attente').length;
  const validatedCount = certificates.filter(c => c.status === 'Validé').length;
  const rejectedCount = certificates.filter(c => c.status === 'Rejeté').length;
  const successRate = certificates.length > 0 ? Math.round((validatedCount / certificates.length) * 100) : 0;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement des certificats...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              Réessayer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Award className="h-4 w-4 mr-2" />
            Gérer les Certificats
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Gestion des Certificats
            </DialogTitle>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>
        </DialogHeader>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Validés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{validatedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taux de Réussite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
              <Progress value={successRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Certificates List */}
        {certificates.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {certificates.map((certificate) => {
                const student = getStudent(certificate.studentId);
                const course = getCourse(certificate.courseId);

                return (
                  <Card key={certificate._id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {student ? `${student.firstName} ${student.lastName}` : 'Étudiant inconnu'}
                          </h4>
                          <Badge variant={getStatusColor(certificate.status)}>
                            {certificate.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {course ? course.title : 'Cours inconnu'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Note: <span className={getGradeColor(certificate.grade)}>{certificate.grade}/100</span></span>
                          <span>Émis: {new Date(certificate.issuedDate).toLocaleDateString('fr-FR')}</span>
                          {certificate.validationDate && (
                            <span>Validé: {new Date(certificate.validationDate).toLocaleDateString('fr-FR')}</span>
                          )}
                          {certificate.certificateNumber && (
                            <span>N°: {certificate.certificateNumber}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {certificate.status === 'En attente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleValidate(certificate)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(certificate)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun certificat disponible</p>
            <p className="text-sm mt-1">Les certificats apparaîtront ici quand les étudiants termineront leurs cours</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CertificateManagementModal;