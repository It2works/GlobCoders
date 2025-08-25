import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CertificateData {
  commonName: string;
  organization: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
}

const AdminCertificateVerification = () => {
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser, user } = useAuth();

  // Handle redirect after successful verification
  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        console.log('Redirecting to admin dashboard...');
        navigate('/admin-dashboard', { replace: true });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, navigate]);

  console.log('AdminCertificateVerification component rendered'); // Debug log

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.json')) {
        setCertificateFile(file);
        setVerificationStatus('idle');
        setErrorMessage('');
      } else {
        toast({
          title: "Format de fichier invalide",
          description: "Veuillez sélectionner un fichier .json (certificat GlobCoders)",
          variant: "destructive"
        });
      }
    }
  };

  const verifyCertificateWithBackend = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get current user data
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      const userData = await response.json();
      const adminId = userData.data.user._id;

      console.log('Sending certificate file for verification:', {
        adminId: adminId,
        fileName: certificateFile?.name,
        fileSize: certificateFile?.size
      });

      // Create FormData to send the file
      const formData = new FormData();
      formData.append('certificateFile', certificateFile!);
      formData.append('adminId', adminId);

      console.log('FormData created with:', {
        hasFile: certificateFile !== null,
        hasAdminId: adminId !== null,
        fileSize: certificateFile?.size
      });

      const verifyResponse = await fetch('http://localhost:5000/api/admin/upload-certificate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formData
      });

      console.log('Response status:', verifyResponse.status);
      console.log('Response headers:', Object.fromEntries(verifyResponse.headers.entries()));

      const verifyData = await verifyResponse.json();
      console.log('Certificate verification response:', verifyData);

      if (verifyResponse.ok && verifyData && verifyData.success) {
        // Extract certificate data from response for display
        console.log('Response data structure:', verifyData.data);

        if (verifyData.data && verifyData.data.certificateData && verifyData.data.certificateData.commonName) {
          console.log('Certificate data found:', verifyData.data.certificateData);
          setCertificateData({
            commonName: verifyData.data.certificateData.commonName,
            organization: verifyData.data.certificateData.organization,
            issuer: verifyData.data.certificateData.issuer,
            validFrom: verifyData.data.certificateData.validFrom,
            validTo: verifyData.data.certificateData.validTo,
            serialNumber: verifyData.data.certificateData.serialNumber
          });
        } else if (verifyData.data && verifyData.data.adminData && verifyData.data.adminData.firstName) {
          console.log('Admin data found:', verifyData.data.adminData);
          // Use admin data to populate certificate info
          setCertificateData({
            commonName: `${verifyData.data.adminData.firstName} ${verifyData.data.adminData.lastName}`,
            organization: "GlobCoders Platform",
            issuer: "GlobCoders Certificate Authority",
            validFrom: "2024-01-01T00:00:00.000Z",
            validTo: "2025-12-31T23:59:59.000Z",
            serialNumber: "GC-2024-ADMIN-001"
          });
        } else {
          console.log('No certificate data in response');
        }
        return true;
      } else {
        console.error('Certificate verification failed:', verifyData.message);
        setErrorMessage(verifyData.message || 'Certificate verification failed');
        return false;
      }
    } catch (error) {
      console.error('Certificate verification error:', error);
      setErrorMessage(`Erreur de connexion: ${error.message}`);
      return false;
    }
  };

  const handleVerification = async () => {
    if (!certificateFile) {
      toast({
        title: "Champs requis",
        description: "Veuillez sélectionner un certificat",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    setErrorMessage('');

    try {
      console.log('Starting certificate verification for file:', certificateFile.name);

      const isValid = await verifyCertificateWithBackend();

      if (isValid) {
        setVerificationStatus('success');
        toast({
          title: "Certificat vérifié",
          description: "Votre certificat a été validé avec succès",
        });

        // Update user state with verified certificate
        if (user) {
          const updatedUser = {
            ...user,
            adminCertificate: {
              ...user.adminCertificate,
              verified: true,
              verifiedAt: new Date(),
            }
          };
          updateUser(updatedUser);
        }

        setShouldRedirect(true); // Set state to trigger redirect
      } else {
        setVerificationStatus('error');
        // Error message is already set in verifyCertificateWithBackend
      }
    } catch (error) {
      console.error('Certificate verification error:', error);
      setVerificationStatus('error');
      setErrorMessage(`Erreur lors de la vérification du certificat: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Vérification du Certificat Administrateur</CardTitle>
          <p className="text-muted-foreground">
            Veuillez télécharger et vérifier votre certificat .json pour accéder au tableau de bord administrateur
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="certificate">Certificat (.json)</Label>
            <div className="relative">
              <Input
                id="certificate"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <Upload className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {certificateFile && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Fichier sélectionné: {certificateFile.name} ({Math.round(certificateFile.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Certificate Data Display */}
          {certificateData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations du Certificat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom Commun</Label>
                  <p className="text-sm text-muted-foreground">{certificateData.commonName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Organisation</Label>
                  <p className="text-sm text-muted-foreground">{certificateData.organization}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Émetteur</Label>
                  <p className="text-sm text-muted-foreground">{certificateData.issuer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Numéro de Série</Label>
                  <p className="text-sm text-muted-foreground">{certificateData.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valide Du</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(certificateData.validFrom).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valide Jusqu'au</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(certificateData.validTo).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {verificationStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Certificat vérifié avec succès! Redirection vers le tableau de bord...
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage || 'Erreur lors de la vérification du certificat'}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleVerification}
            disabled={!certificateFile || isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Vérifier le certificat
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Informations importantes:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Seuls les certificats .json GlobCoders sont acceptés</li>
              <li>Le certificat doit être émis par l'autorité de certification GlobCoders</li>
              <li>La vérification prend quelques secondes</li>
              <li>Le certificat doit correspondre à vos informations d'administrateur</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCertificateVerification;