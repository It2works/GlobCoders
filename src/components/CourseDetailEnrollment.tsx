import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, BookOpen, Star, Play, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SessionBookingModal } from './SessionBookingModal';

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        rating?: {
            average: number;
            count: number;
        };
    };
    level: string;
    price: number;
    duration: {
        total: number;
        lectures: number;
    };
    enrollmentCount: number;
    category: string;
    status: string;
}

interface CourseDetailEnrollmentProps {
    course: Course;
    onEnrollmentSuccess?: () => void;
}

export const CourseDetailEnrollment: React.FC<CourseDetailEnrollmentProps> = ({
    course,
    onEnrollmentSuccess
}) => {
    const { toast } = useToast();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const handleEnrollClick = () => {
        setIsBookingModalOpen(true);
    };

    const handleEnrollmentSuccess = () => {
        setIsBookingModalOpen(false);
        toast({
            title: "Inscription réussie! 🎉",
            description: `Vous êtes maintenant inscrit au cours "${course.title}"`
        });
        onEnrollmentSuccess?.();
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    };

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Course Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <Badge variant="outline" className={getLevelColor(course.level)}>
                            {course.level}
                        </Badge>
                        <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
                        <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                                <Play className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600">Durée</p>
                            <p className="font-semibold">{formatDuration(course.duration.total)}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-600">Leçons</p>
                            <p className="font-semibold">{course.duration.lectures}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-600">Étudiants</p>
                            <p className="font-semibold">{course.enrollmentCount}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                            <p className="text-sm text-gray-600">Prix</p>
                            <p className="font-semibold">{course.price}€</p>
                        </div>
                    </div>
                </div>

                {/* Enrollment Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">
                                {course.price}€
                            </CardTitle>
                            <p className="text-center text-gray-600">Prix du cours complet</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={handleEnrollClick}
                                disabled={isEnrolling}
                                className="w-full h-12 text-lg font-semibold"
                                size="lg"
                            >
                                {isEnrolling ? 'Inscription...' : 'S\'inscrire au cours'}
                            </Button>

                            <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Accès complet au cours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Sessions hebdomadaires réservées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Support du formateur</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Certificat de fin de cours</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Teacher Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        À propos du formateur
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={course.instructor.avatar} />
                            <AvatarFallback className="text-lg">
                                {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">
                                {course.instructor.firstName} {course.instructor.lastName}
                            </h3>
                            <p className="text-gray-600 mb-2">Formateur certifié</p>
                            {course.instructor.rating && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(course.instructor.rating!.average)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        ({course.instructor.rating.count} avis)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Session Booking Modal */}
            <SessionBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                course={course}
                onEnrollmentSuccess={handleEnrollmentSuccess}
            />
        </div>
    );
};

// Helper component for checkmarks
const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
