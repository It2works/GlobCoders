import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar, Save, Plus, Trash2 } from 'lucide-react';

interface TimeSlot {
    id: string;
    start: string;
    end: string;
}

interface DayAvailability {
    day: string;
    enabled: boolean;
    timeSlots: TimeSlot[];
}

interface TeacherAvailabilityManagerProps {
    teacherId: string;
    onAvailabilityChange?: (availability: DayAvailability[]) => void;
}

const DAYS = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
];

const TIME_OPTIONS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

export const TeacherAvailabilityManager: React.FC<TeacherAvailabilityManagerProps> = ({
    teacherId,
    onAvailabilityChange
}) => {
    const { toast } = useToast();
    const [availability, setAvailability] = useState<DayAvailability[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize availability with default structure
        const defaultAvailability: DayAvailability[] = DAYS.map(day => ({
            day: day.key,
            enabled: false,
            timeSlots: []
        }));
        setAvailability(defaultAvailability);

        // Load existing availability from backend
        loadExistingAvailability();
    }, [teacherId]);

    const loadExistingAvailability = async () => {
        if (!teacherId) {
            return;
        }

        setIsLoadingData(true);

        try {
            const { TeacherAvailabilityService } = await import('@/services/sessions');
            const result = await TeacherAvailabilityService.getTeacherAvailability(teacherId);

            if (result && result.availability && result.availability.length > 0) {
                // Transform backend data to component format
                const transformedAvailability = DAYS.map(day => {
                    const existingDay = result.availability.find(d => d.day === day.key);
                    return {
                        day: day.key,
                        enabled: existingDay ? existingDay.enabled : false,
                        timeSlots: existingDay ? existingDay.timeSlots.map(slot => ({
                            id: Date.now().toString() + Math.random(), // Generate unique ID
                            start: slot.start,
                            end: slot.end
                        })) : []
                    };
                });

                setAvailability(transformedAvailability);
                toast({
                    title: "Données chargées",
                    description: `${result.availability.length} jours de disponibilité chargés`
                });
            } else {
                toast({
                    title: "Aucune disponibilité",
                    description: "Aucune disponibilité existante trouvée"
                });
            }
        } catch (error) {
            console.error('Error loading existing availability:', error);
            toast({
                title: "Erreur de chargement",
                description: "Impossible de charger les disponibilités existantes",
                variant: "destructive"
            });
            // Keep default availability if loading fails
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleDayToggle = (dayKey: string, enabled: boolean) => {
        setAvailability(prev => prev.map(day =>
            day.day === dayKey
                ? { ...day, enabled, timeSlots: enabled ? day.timeSlots : [] }
                : day
        ));
    };

    const addTimeSlot = (dayKey: string, event?: React.MouseEvent) => {
        try {
            // Prevent any default behavior that might cause page refresh
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            setAvailability(prev => {
                const newAvailability = prev.map(day =>
                    day.day === dayKey
                        ? {
                            ...day,
                            timeSlots: [...day.timeSlots, {
                                id: Date.now().toString(),
                                start: '09:00',
                                end: '10:00'
                            }]
                        }
                        : day
                );
                return newAvailability;
            });
        } catch (error) {
            console.error('Error in addTimeSlot:', error);
            toast({
                title: "Erreur",
                description: "Erreur lors de l'ajout du créneau horaire",
                variant: "destructive"
            });
        }
    };

    const removeTimeSlot = (dayKey: string, slotId: string, event?: React.MouseEvent) => {
        // Prevent any default behavior
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        setAvailability(prev => prev.map(day =>
            day.day === dayKey
                ? {
                    ...day,
                    timeSlots: day.timeSlots.filter(slot => slot.id !== slotId)
                }
                : day
        ));
    };

    const updateTimeSlot = (dayKey: string, slotId: string, field: 'start' | 'end', value: string) => {
        setAvailability(prev => prev.map(day =>
            day.day === dayKey
                ? {
                    ...day,
                    timeSlots: day.timeSlots.map(slot =>
                        slot.id === slotId
                            ? { ...slot, [field]: value }
                            : slot
                    )
                }
                : day
        ));
    };

    const validateTimeSlots = (slots: TimeSlot[]): boolean => {
        for (let i = 0; i < slots.length; i++) {
            for (let j = i + 1; j < slots.length; j++) {
                const slot1 = slots[i];
                const slot2 = slots[j];

                // Check for overlapping time slots
                if (
                    (slot1.start < slot2.end && slot1.end > slot2.start) ||
                    (slot2.start < slot1.end && slot2.end > slot1.start)
                ) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleSave = async (event?: React.FormEvent) => {
        // Prevent form submission if this is called from a form
        if (event) {
            event.preventDefault();
        }

        // Validate all time slots
        const hasInvalidSlots = availability.some(day =>
            day.enabled && !validateTimeSlots(day.timeSlots)
        );

        if (hasInvalidSlots) {
            toast({
                title: "Erreur de validation",
                description: "Certains créneaux horaires se chevauchent. Veuillez corriger cela.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            // Transform availability to match backend format
            const backendAvailability = availability.map(day => ({
                day: day.day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
                enabled: day.enabled,
                timeSlots: day.timeSlots.map(slot => ({
                    start: slot.start,
                    end: slot.end
                }))
            }));

            // Save to backend using the new service
            const { TeacherAvailabilityService } = await import('@/services/sessions');
            const result = await TeacherAvailabilityService.updateTeacherAvailability(teacherId, backendAvailability);

            // Call the callback if provided
            if (onAvailabilityChange) {
                onAvailabilityChange(availability);
            }

            toast({
                title: "Disponibilités mises à jour",
                description: "Vos créneaux de disponibilité ont été sauvegardés avec succès."
            });
        } catch (error) {
            console.error('Error saving availability:', error);
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder les disponibilités. Veuillez réessayer.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getDayLabel = (dayKey: string): string => {
        return DAYS.find(day => day.key === dayKey)?.label || dayKey;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Gestion des Disponibilités
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {availability.map((day) => (
                    <div key={day.day} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={day.enabled}
                                    onCheckedChange={(enabled) => handleDayToggle(day.day, enabled)}
                                />
                                <Label className="font-medium">{getDayLabel(day.day)}</Label>
                                {day.enabled && (
                                    <Badge variant="secondary" className="text-xs">
                                        {day.timeSlots.length} créneau{day.timeSlots.length > 1 ? 'x' : ''}
                                    </Badge>
                                )}
                            </div>
                            {day.enabled && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => addTimeSlot(day.day, e)}
                                    className="h-8 px-2"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Ajouter
                                </Button>
                            )}
                        </div>

                        {day.enabled && (
                            <div className="ml-8 space-y-2">
                                {day.timeSlots.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Aucun créneau défini. Cliquez sur "Ajouter" pour créer un créneau.
                                    </p>
                                ) : (
                                    day.timeSlots.map((slot) => (
                                        <div key={slot.id} className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="time"
                                                value={slot.start}
                                                onChange={(e) => updateTimeSlot(day.day, slot.id, 'start', e.target.value)}
                                                className="w-24 h-8"
                                            />
                                            <span className="text-muted-foreground">à</span>
                                            <Input
                                                type="time"
                                                value={slot.end}
                                                onChange={(e) => updateTimeSlot(day.day, slot.id, 'end', e.target.value)}
                                                className="w-24 h-8"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => removeTimeSlot(day.day, slot.id, e)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}

                <div className="pt-4 border-t">
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder les Disponibilités'}
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Instructions :</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Activez les jours où vous êtes disponible</li>
                        <li>Ajoutez des créneaux horaires pour chaque jour</li>
                        <li>Les créneaux ne doivent pas se chevaucher</li>
                        <li>Vos élèves verront uniquement ces créneaux disponibles</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};
