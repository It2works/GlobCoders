import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format, addWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface AvailableTimeSlot {
    start: Date;
    end: Date;
    formatted: string;
    isAvailable: boolean;
}

interface AvailableTimeSlotsProps {
    teacherId: string;
    courseDuration: number; // in weeks
    onTimeSlotSelect: (selectedSlot: AvailableTimeSlot) => void;
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
}

export const AvailableTimeSlots: React.FC<AvailableTimeSlotsProps> = ({
    teacherId,
    courseDuration,
    onTimeSlotSelect,
    selectedDate,
    onDateSelect
}) => {
    const { toast } = useToast();
    const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
    const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null);

    // Generate available dates for the next 8 weeks
    const generateAvailableDates = () => {
        const dates: Date[] = [];
        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start

        for (let week = 0; week < 8; week++) {
            for (let day = 0; day < 7; day++) {
                const date = addDays(addWeeks(startDate, week), day);
                if (date >= new Date()) { // Only future dates
                    dates.push(date);
                }
            }
        }
        return dates;
    };

    const availableDates = generateAvailableDates();

    useEffect(() => {
        if (currentDate) {
            fetchAvailableTimeSlots(currentDate);
        }
    }, [currentDate, teacherId]);

    const fetchAvailableTimeSlots = async (date: Date) => {
        setIsLoading(true);
        try {
            const { SessionService } = await import('@/services/sessions');
            const slots = await SessionService.getAvailableTimeSlots(teacherId, date, 60);

            // Transform slots to include availability status
            const transformedSlots: AvailableTimeSlot[] = slots.map(slot => ({
                start: slot.start,
                end: slot.end,
                formatted: slot.formatted,
                isAvailable: true
            }));

            setAvailableSlots(transformedSlots);
        } catch (error) {
            console.error('Error fetching available time slots:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les créneaux disponibles",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setCurrentDate(date);
            onDateSelect?.(date);
            setSelectedSlot(null);
        }
    };

    const handleSlotSelect = (slot: AvailableTimeSlot) => {
        setSelectedSlot(slot);
        onTimeSlotSelect(slot);
    };

    const formatTime = (date: Date) => {
        return format(date, 'HH:mm', { locale: fr });
    };

    const formatDate = (date: Date) => {
        return format(date, 'EEEE d MMMM', { locale: fr });
    };

    const getDayOfWeek = (date: Date) => {
        return format(date, 'EEEE', { locale: fr });
    };

    const isDateAvailable = (date: Date) => {
        // Check if the date is within the next 8 weeks and not in the past
        const today = new Date();
        const eightWeeksFromNow = addWeeks(today, 8);
        return date >= today && date <= eightWeeksFromNow;
    };

    const getDateBadgeVariant = (date: Date) => {
        if (isSameDay(date, currentDate)) return 'default';
        if (isDateAvailable(date)) return 'secondary';
        return 'outline';
    };

    return (
        <div className="space-y-6">
            {/* Date Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        Sélectionnez une date
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Calendar */}
                        <div>
                            <Calendar
                                mode="single"
                                selected={currentDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => !isDateAvailable(date)}
                                className="rounded-md border"
                            />
                        </div>

                        {/* Quick Date Selection */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Dates rapides</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {availableDates.slice(0, 8).map((date) => (
                                    <Button
                                        key={date.toISOString()}
                                        variant={getDateBadgeVariant(date)}
                                        size="sm"
                                        onClick={() => handleDateSelect(date)}
                                        className="h-auto p-2 flex flex-col items-center"
                                    >
                                        <span className="text-xs font-medium">
                                            {getDayOfWeek(date)}
                                        </span>
                                        <span className="text-xs">
                                            {format(date, 'd MMM', { locale: fr })}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Date Info */}
            {currentDate && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Créneaux disponibles pour {formatDate(currentDate)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Chargement des créneaux...</span>
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600 mb-4">
                                    <p>✅ Créneaux disponibles pour ce cours ({courseDuration} semaines)</p>
                                    <p>📅 Votre horaire sera réservé chaque semaine à cette heure</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {availableSlots.map((slot, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            onClick={() => handleSlotSelect(slot)}
                                            className="h-16 flex flex-col items-center justify-center space-y-1"
                                        >
                                            <span className="font-medium">
                                                {formatTime(slot.start)} - {formatTime(slot.end)}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {slot.formatted}
                                            </span>
                                        </Button>
                                    ))}
                                </div>

                                {selectedSlot && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-medium text-blue-900 mb-2">
                                            ✅ Créneau sélectionné
                                        </h4>
                                        <p className="text-sm text-blue-700">
                                            Vous serez inscrit pour <strong>{courseDuration} semaines</strong>
                                            à <strong>{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</strong>
                                            chaque <strong>{getDayOfWeek(currentDate)}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Aucun créneau disponible
                                </h3>
                                <p className="text-gray-600">
                                    Aucun créneau n'est disponible pour cette date.
                                    Veuillez sélectionner une autre date.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
