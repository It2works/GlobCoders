import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, CheckCircle, CreditCard, Calendar as CalendarIcon } from 'lucide-react';
import { PaymentModal } from '@/components/PaymentModal';
import { SessionService, TeacherAvailabilityService } from '@/services/sessions';
import { AvailableTimeSlot, TeacherAvailability } from '@/services/types';

interface ModernSessionBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    teacherId: string;
    courseTitle: string;
    teacherName: string;
}

const ModernSessionBookingModal: React.FC<ModernSessionBookingModalProps> = ({
    isOpen,
    onClose,
    courseId,
    teacherId,
    courseTitle,
    teacherName
}) => {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailableTimeSlot | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);

    useEffect(() => {
        if (isOpen && teacherId) {
            loadAvailableDates();
        }
    }, [isOpen, teacherId]);

    useEffect(() => {
        if (selectedDate && teacherId) {
            loadAvailableTimeSlots();
        }
    }, [selectedDate, teacherId]);

    const loadAvailableDates = async () => {
        try {
            setIsLoading(true);
            const today = new Date();
            const dates: Date[] = [];

            // Check next 4 weeks for available dates
            for (let week = 0; week < 4; week++) {
                const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), week * 7);

                for (let day = 0; day < 7; day++) {
                    const currentDate = addDays(weekStart, day);

                    if (currentDate >= today) {
                        // Check if teacher has availability on this date
                        try {
                            const slots = await SessionService.getAvailableTimeSlots(teacherId, currentDate, 60);
                            if (slots.length > 0) {
                                dates.push(currentDate);
                            }
                        } catch (error) {
                            // Skip dates with errors
                            continue;
                        }
                    }
                }
            }

            setAvailableDates(dates);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les dates disponibles",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadAvailableTimeSlots = async () => {
        if (!selectedDate) return;

        try {
            setIsLoading(true);
            const slots = await SessionService.getAvailableTimeSlots(teacherId, selectedDate, 60);
            setAvailableSlots(slots);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les créneaux disponibles",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookSession = () => {
        if (!selectedDate || !selectedTimeSlot) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner une date et un créneau",
                variant: "destructive"
            });
            return;
        }

        setShowPayment(true);
    };

    const handlePaymentSuccess = async () => {
        if (!selectedDate || !selectedTimeSlot) return;

        try {
            // Create session data
            const sessionData = {
                title: `Session - ${courseTitle}`,
                description: `Session de cours pour ${courseTitle}`,
                course: courseId,
                startTime: selectedTimeSlot.start,
                endTime: selectedTimeSlot.end,
                duration: 60, // Default duration
                sessionType: 'live' as const,
                capacity: 1, // Individual session
                notes: `Session réservée par l'étudiant`
            };

            // Create the session
            const session = await SessionService.createSession(sessionData);

            // Enroll the student in the session
            await SessionService.enrollInSession(session._id);

            toast({
                title: "Session réservée !",
                description: "Votre session a été réservée et payée avec succès.",
            });

            setShowPayment(false);
            onClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de créer la session. Veuillez réessayer.",
                variant: "destructive"
            });
        }
    };

    const getDayName = (date: Date): string => {
        const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        return days[date.getDay()];
    };

    const isDateAvailable = (date: Date): boolean => {
        return availableDates.some(availableDate => isSameDay(date, availableDate));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Réserver une session - {courseTitle}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar Selection */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Sélectionnez une date</h3>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{
                                available: availableDates
                            }}
                            modifiersStyles={{
                                available: {
                                    backgroundColor: 'hsl(var(--primary))',
                                    color: 'hsl(var(--primary-foreground))',
                                    borderRadius: '6px'
                                }
                            }}
                            disabled={(date) => !isDateAvailable(date)}
                            locale={fr}
                            className="rounded-md border pointer-events-auto"
                        />

                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <strong>Formateur:</strong> {teacherName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Disponibilités affichées pour les 4 prochaines semaines
                            </p>
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Sélectionnez un créneau</h3>

                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : selectedDate ? (
                            availableSlots.length > 0 ? (
                                <ScrollArea className="h-64">
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableSlots.map((slot, index) => (
                                            <Button
                                                key={index}
                                                variant={selectedTimeSlot === slot ? "default" : "outline"}
                                                className="h-12 flex flex-col items-center justify-center"
                                                onClick={() => setSelectedTimeSlot(slot)}
                                            >
                                                <Clock className="h-4 w-4 mb-1" />
                                                <span className="text-sm">{slot.formatted}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Aucun créneau disponible</p>
                                    <p className="text-sm">Veuillez sélectionner une autre date</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Sélectionnez une date</p>
                                <p className="text-sm">pour voir les créneaux disponibles</p>
                            </div>
                        )}

                        {/* Summary */}
                        {selectedDate && selectedTimeSlot && (
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <h4 className="font-semibold text-primary mb-2">Récapitulatif</h4>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Cours:</strong> {courseTitle}</p>
                                    <p><strong>Formateur:</strong> {teacherName}</p>
                                    <p><strong>Date:</strong> {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</p>
                                    <p><strong>Heure:</strong> {selectedTimeSlot.formatted}</p>
                                    <p><strong>Durée:</strong> 1 heure</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleBookSession}
                        disabled={!selectedDate || !selectedTimeSlot || isLoading}
                        className="flex items-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        Procéder au paiement
                    </Button>
                </div>
            </DialogContent>

            {showPayment && selectedDate && selectedTimeSlot && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    sessionDetails={{
                        courseId: courseId,
                        courseName: courseTitle,
                        teacherName: teacherName,
                        teacherId: teacherId,
                        date: format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }),
                        time: selectedTimeSlot.formatted,
                        price: 50 // Default price - you can make this configurable
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </Dialog>
    );
};

export default ModernSessionBookingModal;
