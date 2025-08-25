import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle, User, Mail, Calendar, Video, AlertCircle, RefreshCw, ArrowLeft, Code } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const TeacherPendingApproval = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Show loading state while user data is being fetched
    if (loading || !user) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner size="lg" />
                    </div>
                </div>
            </div>
        );
    }

    const getStatusInfo = () => {
        if (!user) return { status: 'unknown', message: 'Statut inconnu' };

        switch (user.teacherApprovalStatus) {
            case 'pending':
                return {
                    status: 'pending',
                    message: 'Votre candidature est en cours d\'examen',
                    description: 'Notre équipe examine votre vidéo de présentation et votre profil. Ce processus prend généralement 1-3 jours ouvrables.',
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    badgeVariant: 'secondary' as const
                };
            case 'approved':
                return {
                    status: 'approved',
                    message: 'Félicitations ! Vous êtes approuvé',
                    description: 'Votre candidature a été acceptée. Vous pouvez maintenant accéder à votre tableau de bord formateur.',
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    badgeVariant: 'default' as const
                };
            case 'rejected':
                return {
                    status: 'rejected',
                    message: 'Votre candidature n\'a pas été acceptée',
                    description: 'Nous avons examiné votre candidature mais nous ne pouvons pas l\'accepter pour le moment. Vous pouvez contacter notre support pour plus d\'informations.',
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    badgeVariant: 'destructive' as const
                };
            default:
                return {
                    status: 'unknown',
                    message: 'Statut inconnu',
                    description: 'Impossible de déterminer votre statut actuel.',
                    icon: AlertCircle,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    badgeVariant: 'secondary' as const
                };
        }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    const steps = [
        {
            id: 1,
            title: 'Inscription complétée',
            description: 'Votre compte a été créé avec succès',
            completed: true
        },
        {
            id: 2,
            title: 'Vidéo de présentation',
            description: 'Votre vidéo a été uploadée',
            completed: !!user?.presentationVideo
        },
        {
            id: 3,
            title: 'Examen en cours',
            description: 'Notre équipe examine votre candidature',
            completed: statusInfo.status === 'approved' || statusInfo.status === 'rejected'
        },
        {
            id: 4,
            title: 'Décision finale',
            description: statusInfo.status === 'approved' ? 'Approuvé - Accès accordé' :
                statusInfo.status === 'rejected' ? 'Rejeté - Contactez le support' : 'En attente',
            completed: statusInfo.status === 'approved' || statusInfo.status === 'rejected'
        }
    ];

    const currentStep = steps.findIndex(step => !step.completed) + 1;
    const progressPercentage = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back to Home */}
                    <div className="mb-6">
                        <Link
                            to="/"
                            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour à l'accueil
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                GlobCoders
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Statut de votre candidature
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Suivez l'avancement de votre demande de formateur
                        </p>
                    </div>

                    {/* Status Card */}
                    <Card className={`mb-8 ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 shadow-lg`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                                {statusInfo.message}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6 text-base">
                                {statusInfo.description}
                            </p>

                            {statusInfo.status === 'approved' && (
                                <Button
                                    onClick={() => navigate('/teacher-dashboard')}
                                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                                    size="lg"
                                >
                                    Accéder à mon tableau de bord
                                </Button>
                            )}

                            {statusInfo.status === 'rejected' && (
                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/contact')}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Contacter le support
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="w-full"
                                    >
                                        Retour à l'accueil
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Steps */}
                    <Card className="mb-8 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <RefreshCw className="h-5 w-5" />
                                Progression de votre candidature
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.completed
                                                ? 'bg-green-100 text-green-600 shadow-md'
                                                : index + 1 === currentStep
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {step.completed ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <span className="text-sm font-medium">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold text-lg transition-colors ${step.completed ? 'text-green-600' :
                                                    index + 1 === currentStep ? 'text-primary' : 'text-muted-foreground'
                                                }`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-muted-foreground mt-1">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                                    <span className="font-medium">Progression globale</span>
                                    <span className="font-bold">{progressPercentage}%</span>
                                </div>
                                <Progress
                                    value={progressPercentage}
                                    className="h-3"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Teacher Information */}
                    <Card className="mb-8 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <User className="h-5 w-5" />
                                Vos informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-sm text-muted-foreground">Nom complet</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{user?.email}</p>
                                            <p className="text-sm text-muted-foreground">Adresse email</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">
                                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Date d'inscription</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Badge variant={statusInfo.badgeVariant} className="text-sm">
                                            {statusInfo.status === 'pending' ? 'En attente' :
                                                statusInfo.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                                        </Badge>
                                        <div>
                                            <p className="font-medium">Statut de candidature</p>
                                            <p className="text-sm text-muted-foreground">Statut actuel</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Video className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className={`font-medium ${user?.presentationVideo ? 'text-green-600' : 'text-red-600'}`}>
                                                {user?.presentationVideo ? 'Vidéo uploadée' : 'Vidéo manquante'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Vidéo de présentation</p>
                                        </div>
                                    </div>
                                    {user?.teacherApprovalDate && (
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(user.teacherApprovalDate).toLocaleDateString('fr-FR')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Date de décision</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help Section */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertCircle className="h-5 w-5" />
                                Besoin d'aide ?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <p className="text-muted-foreground text-base">
                                    Si vous avez des questions sur votre candidature ou si vous souhaitez plus d'informations,
                                    n'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/contact')}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Contacter le support
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Se déconnecter
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TeacherPendingApproval; 