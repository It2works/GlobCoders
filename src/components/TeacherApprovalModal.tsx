import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Play, Pause, Volume2, VolumeX, Maximize, Clock, User, Mail, Calendar } from 'lucide-react';

interface Teacher {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    presentationVideo: string;
    teacherApprovalStatus: 'pending' | 'approved' | 'rejected';
    teacherApprovalDate?: Date;
    teacherRejectionReason?: string;
    teacherApprovalNotes?: string;
    createdAt: Date;
    expertise?: string[];
    bio?: string;
}

interface TeacherApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: Teacher | null;
    onApprove: (teacherId: string, notes?: string) => Promise<void>;
    onReject: (teacherId: string, reason: string, notes?: string) => Promise<void>;
}

const TeacherApprovalModal: React.FC<TeacherApprovalModalProps> = ({
    isOpen,
    onClose,
    teacher,
    onApprove,
    onReject
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionNotes, setRejectionNotes] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (isOpen && teacher) {
            setApprovalNotes('');
            setRejectionReason('');
            setRejectionNotes('');
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [isOpen, teacher]);

    const handleApprove = async () => {
        if (!teacher) return;

        setIsLoading(true);
        try {
            await onApprove(teacher._id, approvalNotes);
            toast({
                title: "Formateur approuvé",
                description: `${teacher.firstName} ${teacher.lastName} a été approuvé avec succès.`,
            });
            onClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible d'approuver le formateur. Veuillez réessayer.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!teacher || !rejectionReason.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez fournir une raison de rejet.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await onReject(teacher._id, rejectionReason, rejectionNotes);
            toast({
                title: "Formateur rejeté",
                description: `${teacher.firstName} ${teacher.lastName} a été rejeté.`,
                variant: "destructive",
            });
            onClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de rejeter le formateur. Veuillez réessayer.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlay = () => {
        if (videoRef) {
            if (isPlaying) {
                videoRef.pause();
            } else {
                videoRef.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef) {
            videoRef.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef) {
            setCurrentTime(videoRef.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef) {
            setDuration(videoRef.duration);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef) {
            const newTime = (parseFloat(e.target.value) / 100) * duration;
            videoRef.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    if (!teacher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Évaluation du formateur: {teacher.firstName} {teacher.lastName}
                    </DialogTitle>
                    <DialogDescription>
                        Veuillez évaluer la vidéo de présentation du formateur et prendre une décision.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Teacher Information */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informations du formateur</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{teacher.firstName} {teacher.lastName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Inscrit le {new Date(teacher.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={teacher.teacherApprovalStatus === 'pending' ? 'secondary' :
                                        teacher.teacherApprovalStatus === 'approved' ? 'default' : 'destructive'}>
                                        {teacher.teacherApprovalStatus === 'pending' ? 'En attente' :
                                            teacher.teacherApprovalStatus === 'approved' ? 'Approuvé' : 'Rejeté'}
                                    </Badge>
                                </div>
                                {teacher.expertise && teacher.expertise.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium">Expertise:</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {teacher.expertise.map((skill, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {teacher.bio && (
                                    <div>
                                        <Label className="text-sm font-medium">Bio:</Label>
                                        <p className="text-sm text-muted-foreground mt-1">{teacher.bio}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Approval Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Approve Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="approval-notes">Notes d'approbation (optionnel)</Label>
                                    <Textarea
                                        id="approval-notes"
                                        placeholder="Ajoutez des notes positives sur ce formateur..."
                                        value={approvalNotes}
                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                        rows={3}
                                    />
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isLoading}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approuver le formateur
                                    </Button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Ou</span>
                                    </div>
                                </div>

                                {/* Reject Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="rejection-reason">Raison du rejet *</Label>
                                    <Input
                                        id="rejection-reason"
                                        placeholder="Ex: Vidéo de présentation insuffisante..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        required
                                    />
                                    <Label htmlFor="rejection-notes">Notes de rejet (optionnel)</Label>
                                    <Textarea
                                        id="rejection-notes"
                                        placeholder="Ajoutez des détails sur le rejet..."
                                        value={rejectionNotes}
                                        onChange={(e) => setRejectionNotes(e.target.value)}
                                        rows={3}
                                    />
                                    <Button
                                        onClick={handleReject}
                                        disabled={isLoading || !rejectionReason.trim()}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Rejeter le formateur
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Video Player */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Play className="h-5 w-5" />
                                    Vidéo de présentation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teacher.presentationVideo ? (
                                    <>
                                        <div className="relative bg-black rounded-lg overflow-hidden">
                                            <video
                                                ref={setVideoRef}
                                                className="w-full h-64 object-contain"
                                                onTimeUpdate={handleTimeUpdate}
                                                onLoadedMetadata={handleLoadedMetadata}
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                                onEnded={() => setIsPlaying(false)}
                                            >
                                                <source src={teacher.presentationVideo} type="video/mp4" />
                                                Votre navigateur ne supporte pas la lecture vidéo.
                                            </video>

                                            {/* Video Controls */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                                <div className="flex items-center gap-2 text-white">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={togglePlay}
                                                        className="text-white hover:text-white hover:bg-white/20"
                                                    >
                                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={toggleMute}
                                                        className="text-white hover:text-white hover:bg-white/20"
                                                    >
                                                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                                    </Button>

                                                    <div className="flex-1 flex items-center gap-2">
                                                        <span className="text-xs">{formatTime(currentTime)}</span>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={duration ? (currentTime / duration) * 100 : 0}
                                                            onChange={handleSeek}
                                                            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <span className="text-xs">{formatTime(duration)}</span>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-white hover:text-white hover:bg-white/20"
                                                    >
                                                        <Maximize className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Durée: {formatTime(duration)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                            <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Aucune vidéo de présentation</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Previous Approval Info */}
                        {teacher.teacherApprovalStatus !== 'pending' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Décision précédente</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={teacher.teacherApprovalStatus === 'approved' ? 'default' : 'destructive'}>
                                            {teacher.teacherApprovalStatus === 'approved' ? 'Approuvé' : 'Rejeté'}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            le {teacher.teacherApprovalDate ? new Date(teacher.teacherApprovalDate).toLocaleDateString('fr-FR') : 'N/A'}
                                        </span>
                                    </div>
                                    {teacher.teacherRejectionReason && (
                                        <div>
                                            <Label className="text-sm font-medium">Raison du rejet:</Label>
                                            <p className="text-sm text-muted-foreground mt-1">{teacher.teacherRejectionReason}</p>
                                        </div>
                                    )}
                                    {teacher.teacherApprovalNotes && (
                                        <div>
                                            <Label className="text-sm font-medium">Notes:</Label>
                                            <p className="text-sm text-muted-foreground mt-1">{teacher.teacherApprovalNotes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TeacherApprovalModal; 