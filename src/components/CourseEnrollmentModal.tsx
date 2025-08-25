import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Clock, Calendar as CalendarIcon, User, Star, BookOpen, CreditCard, CheckCircle, Lock } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherAvailabilityService } from '@/services/sessions';
import { STRIPE_CONFIG, STRIPE_ERROR_MESSAGES, STRIPE_SUCCESS_MESSAGES } from '@/config/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface AvailableTimeSlot {
    start: Date;
    end: Date;
    formatted: string;
    isAvailable: boolean;
}

interface TeacherAvailability {
    day: string;
    enabled: boolean;
    timeSlots: Array<{
        start: string;
        end: string;
    }>;
}

interface CourseEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: any;
    onEnrollmentSuccess: () => void;
}

const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({
    isOpen,
    onClose,
    course,
    onEnrollmentSuccess
}) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<{ date: Date; timeSlot: string }[]>([]);
    const [currentStep, setCurrentStep] = useState<'course-details' | 'time-booking' | 'payment' | 'confirmation'>('course-details');
    const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailability[]>([]);
    const [sessionBasedAvailability, setSessionBasedAvailability] = useState<{ [date: string]: Array<any> }>({});
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    const courseDurationWeeks = Math.ceil((course.duration?.total || 60) / 60);

    useEffect(() => {
        if (isOpen && course) {
            loadTeacherAvailability();
        }
    }, [isOpen, course]);

    // Fetch existing sessions to check for conflicts
    useEffect(() => {
        console.log('🔄 [useEffect] selectedDates changed:', selectedDates);
        console.log('🔄 [useEffect] course.instructor._id:', course?.instructor?._id);

        if (selectedDates.length > 0 && course?.instructor?._id) {
            console.log('🚀 [useEffect] Calling fetchExistingSessions...');
            fetchExistingSessions();
        } else {
            console.log('⚠️ [useEffect] Not calling fetchExistingSessions - missing data');
        }
    }, [selectedDates, course?.instructor?._id]);

    const fetchExistingSessions = async () => {
        console.log('🎯 [fetchExistingSessions] Function called!');
        console.log('🎯 [fetchExistingSessions] selectedDates:', selectedDates);
        console.log('🎯 [fetchExistingSessions] course.instructor._id:', course?.instructor?._id);

        const existingSessions: { [date: string]: Array<{ startTime: string, endTime: string }> } = {};

        for (const date of selectedDates) {
            const dateStr = format(date, 'yyyy-MM-dd');
            try {
                // Get existing sessions for this teacher on this date
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sessions?teacher=${course.instructor._id}&date=${dateStr}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const sessions = result.data?.sessions || [];

                    // Show ALL sessions regardless of status for debugging
                    const allSessions = sessions;

                    // Validate that sessions are actually for the requested date
                    const validatedSessions = allSessions.filter((session: any) => {
                        const sessionDate = new Date(session.startTime);
                        const requestedDate = new Date(dateStr);
                        const isSameDate = sessionDate.toDateString() === requestedDate.toDateString();

                        if (!isSameDate) {
                            console.warn(`⚠️ [Date Mismatch] Session "${session.title}" is for ${sessionDate.toDateString()} but requested date is ${requestedDate.toDateString()}`);
                        }

                        return isSameDate;
                    });

                    existingSessions[dateStr] = validatedSessions.map((session: any) => ({
                        startTime: session.startTime,
                        endTime: session.endTime,
                        status: session.status // Include status for debugging
                    }));

                    console.log(`✅ [Existing Sessions] ${dateStr}: Found ${validatedSessions.length} validated sessions for this date`);
                    validatedSessions.forEach((session: any) => {
                        console.log(`   - ${session.title}: ${new Date(session.startTime).toTimeString()} - ${new Date(session.endTime).toTimeString()} (Status: ${session.status})`);
                    });

                    if (validatedSessions.length !== allSessions.length) {
                        console.warn(`⚠️ [Date Mismatch] Filtered out ${allSessions.length - validatedSessions.length} sessions that don't match the requested date ${dateStr}`);
                    }
                } else {
                    console.warn(`⚠️ [Existing Sessions] Failed for ${dateStr}, no sessions found`);
                    existingSessions[dateStr] = [];
                }
            } catch (error) {
                console.error(`❌ [Existing Sessions] Error for ${dateStr}:`, error);
                existingSessions[dateStr] = [];
            }
        }

        setSessionBasedAvailability(existingSessions);
    };

    const loadTeacherAvailability = async () => {
        if (!course?.instructor?._id) {
            console.log('No instructor ID found in course:', course);
            return;
        }

        setIsLoadingAvailability(true);
        try {
            console.log('Loading teacher availability for instructor ID:', course.instructor._id);
            console.log('Course instructor data:', course.instructor);

            // Try to fetch availability directly first to debug
            const directResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/teachers/${course.instructor._id}/availability`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Direct API response status:', directResponse.status);
            console.log('Direct API response headers:', Object.fromEntries(directResponse.headers.entries()));
            console.log('Direct API response URL:', directResponse.url);

            if (!directResponse.ok) {
                const errorText = await directResponse.text();
                console.error('Direct API error response:', errorText);
                console.error('Response status:', directResponse.status);
                console.error('Response status text:', directResponse.statusText);
                throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText} - ${errorText}`);
            }

            const directResult = await directResponse.json();
            console.log('Direct API result:', directResult);
            console.log('Direct API result type:', typeof directResult);
            console.log('Direct API result keys:', Object.keys(directResult));
            console.log('Direct API result.data:', directResult.data);
            console.log('Direct API result.data?.availability:', directResult.data?.availability);

            // Now try the service method
            console.log('Trying TeacherAvailabilityService...');
            const serviceResponse = await TeacherAvailabilityService.getTeacherAvailability(course.instructor._id);
            console.log('Service response:', serviceResponse);

            // Use whichever response has data
            let availabilityData = null;
            if (directResult.success && directResult.data?.availability) {
                availabilityData = directResult.data.availability;
                console.log('Using direct API data');
            } else if (serviceResponse && serviceResponse.availability) {
                availabilityData = serviceResponse.availability;
                console.log('Using service data');
            } else {
                console.warn('No availability data found in either response');
                console.warn('Direct result:', directResult);
                console.warn('Service result:', serviceResponse);
            }

            if (availabilityData && availabilityData.length > 0) {
                // Transform backend data to match our interface
                const transformedAvailability = availabilityData.map((day: any) => ({
                    day: day.day,
                    enabled: day.enabled,
                    timeSlots: day.timeSlots || []
                }));

                console.log('Transformed availability:', transformedAvailability);
                setTeacherAvailability(transformedAvailability);
            } else {
                console.warn('No availability data found, using fallback');
                // Fallback: create default availability structure
                const fallbackAvailability = [
                    { day: 'monday', enabled: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
                    { day: 'tuesday', enabled: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
                    { day: 'wednesday', enabled: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
                    { day: 'thursday', enabled: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
                    { day: 'friday', enabled: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
                    { day: 'saturday', enabled: false, timeSlots: [] },
                    { day: 'sunday', enabled: false, timeSlots: [] }
                ];
                setTeacherAvailability(fallbackAvailability);

                toast({
                    title: "Aucune disponibilité configurée",
                    description: "Le professeur n'a pas encore configuré ses disponibilités. Utilisation d'un planning par défaut.",
                    variant: "default"
                });
            }
        } catch (error) {
            console.error('Error loading teacher availability:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });

            toast({
                title: "Erreur",
                description: "Impossible de charger la disponibilité du professeur. Vérifiez que le serveur backend est en cours d'exécution.",
                variant: "destructive"
            });
            setTeacherAvailability([]);
        } finally {
            setIsLoadingAvailability(false);
        }
    };

    const handleEnrollment = async () => {
        if (selectedDates.length !== courseDurationWeeks) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner le bon nombre de créneaux",
                variant: "destructive"
            });
            return;
        }

        setIsProcessingPayment(true);
        try {
            // Create enrollment data for MongoDB
            const enrollmentData = {
                // The backend only needs the course ID (which is in the URL)
                // and the user ID (which comes from the auth token)
                // No need to send additional data
            };

            console.log('Creating enrollment with data:', enrollmentData);

            // Call backend API to create enrollment in MongoDB
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/${course._id}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to enroll in course');
            }

            const result = await response.json();
            console.log('Enrollment successful:', result);

            toast({
                title: "Inscription réussie !",
                description: `Vous êtes maintenant inscrit au cours "${course.title}"`,
            });

            // Move to confirmation step
            setCurrentStep('confirmation');
            onEnrollmentSuccess();

        } catch (error) {
            console.error('Enrollment error:', error);
            toast({
                title: "Erreur d'inscription",
                description: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'inscription",
                variant: "destructive"
            });
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Initialize Stripe
    const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

    // Stripe Payment Form Component
    const StripePaymentForm = ({ course, selectedDates, selectedTimeSlots, onSuccess, onError }: {
        course: any;
        selectedDates: Date[];
        selectedTimeSlots: { date: Date; timeSlot: string }[];
        onSuccess: () => void;
        onError: (error: string) => void;
    }) => {
        const stripe = useStripe();
        const elements = useElements();
        const { toast } = useToast();
        const { user } = useAuth();
        const [isProcessing, setIsProcessing] = useState(false);
        const [cardholderName, setCardholderName] = useState('');

        const handleSubmit = async (event: React.FormEvent) => {
            event.preventDefault();

            if (!stripe || !elements) {
                return;
            }

            setIsProcessing(true);

            try {
                // Create payment intent
                const paymentIntentResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stripe/create-payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: course.price * 100,
                        currency: STRIPE_CONFIG.CURRENCY,
                        courseId: course._id,
                        metadata: {
                            courseId: String(course._id),
                            teacherId: String(course.instructor._id),
                            courseTitle: String(course.title),
                            studentName: String(`${user?.firstName} ${user?.lastName}`),
                            paymentType: 'course_enrollment',
                            selectedDates: selectedDates.map(date => format(date, 'yyyy-MM-dd')).join(', ')
                        }
                    })
                });

                if (!paymentIntentResponse.ok) {
                    throw new Error('Failed to create payment intent');
                }

                const { clientSecret } = await paymentIntentResponse.json();

                // Confirm payment with Stripe
                const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement)!,
                        billing_details: {
                            name: cardholderName,
                        },
                    }
                });

                if (error) {
                    onError(error.message || 'Payment failed');
                } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                    toast({
                        title: STRIPE_SUCCESS_MESSAGES.PAYMENT_SUCCESS,
                        description: STRIPE_SUCCESS_MESSAGES.ENROLLMENT_SUCCESS,
                    });
                    onSuccess();
                }
            } catch (error) {
                onError(error instanceof Error ? error.message : 'Payment failed');
            } finally {
                setIsProcessing(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du titulaire de la carte
                    </label>
                    <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="Nom complet"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Informations de la carte
                    </label>
                    <div className="p-3 border border-gray-300 rounded-md">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Traitement du paiement...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payer {course.price}€ et s'inscrire
                        </>
                    )}
                </Button>
            </form>
        );
    };

    const handleClose = () => {
        setCurrentStep('course-details');
        setSelectedDates([]);
        setSelectedTimeSlots([]);
        onClose();
    };

    if (!course) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Inscription au cours - {course.title}
                    </DialogTitle>
                    <DialogDescription>
                        Remplissez les détails pour vous inscrire au cours de {course.title}.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Étape {currentStep === 'course-details' ? 1 : currentStep === 'time-booking' ? 2 : currentStep === 'payment' ? 3 : 4} sur 4</span>
                        <span>{Math.round((currentStep === 'course-details' ? 1 : currentStep === 'time-booking' ? 2 : currentStep === 'payment' ? 3 : 4) / 4 * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep === 'course-details' ? 1 : currentStep === 'time-booking' ? 2 : currentStep === 'payment' ? 3 : 4) / 4 * 100}%` }}></div>
                    </div>
                </div>

                {/* Step 1: Course Details */}
                {currentStep === 'course-details' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Détails du cours</h2>
                            <p className="text-gray-600 mb-6">{course.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                    <div className="font-bold">{Math.round((course.duration?.total || 60) / 60)}h</div>
                                    <div className="text-sm text-blue-700">Durée</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <User className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                    <div className="font-bold">{course.enrollmentCount || 0}</div>
                                    <div className="text-sm text-green-700">Étudiants</div>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                    <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                                    <div className="font-bold">{course.rating?.average?.toFixed(1) || 'N/A'}</div>
                                    <div className="text-sm text-yellow-700">Note</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <CalendarIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                    <div className="font-bold">{courseDurationWeeks}</div>
                                    <div className="text-sm text-purple-700">Sessions</div>
                                </div>
                            </div>

                            <div className="text-center p-6 bg-primary/10 rounded-lg">
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                                </div>
                                <p className="text-primary/80">Prix du cours complet</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={handleClose}>Annuler</Button>
                            <Button onClick={() => setCurrentStep('time-booking')} className="bg-blue-600 hover:bg-blue-700">
                                Choisir mes créneaux
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Time Booking */}
                {currentStep === 'time-booking' && (
                    <div className="space-y-6 max-w-4xl mx-auto max-h-[70vh] overflow-y-auto">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2 text-gray-800">Choisir vos créneaux</h3>
                            <p className="text-base text-gray-600">Sélectionnez {courseDurationWeeks} session{courseDurationWeeks > 1 ? 's' : ''} pour votre cours</p>
                        </div>

                        {/* Date Selection and Time Slot Selection in Row */}
                        <div className="mb-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Date Selection */}
                                <div className="order-2 lg:order-1">
                                    <h4 className="font-bold text-lg mb-4 text-center text-blue-600 flex items-center justify-center gap-2">
                                        <span className="text-xl">📅</span>
                                        Sélection des dates
                                    </h4>
                                    <div className="flex justify-center">
                                        <div className="w-72">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDates[0]}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        // Allow browsing different dates to see availability
                                                        setSelectedDates([date]);
                                                        // Don't reset time slots when browsing dates
                                                        // setSelectedTimeSlots([]);
                                                    }
                                                }}
                                                disabled={(date) => {
                                                    const dayKey = format(date, 'EEEE').toLowerCase();
                                                    const availability = teacherAvailability.find(a => a.day === dayKey);
                                                    return !availability?.enabled || availability.timeSlots?.length === 0;
                                                }}
                                                className="rounded-xl border-2 shadow-lg bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        {selectedDates.length > 0 ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full border-2 border-green-200">
                                                <span className="text-lg">✅</span>
                                                <span className="text-sm">
                                                    Date sélectionnée: {format(selectedDates[0], 'EEEE d MMMM yyyy', { locale: fr })}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full border-2 border-gray-200">
                                                <span className="text-lg">📅</span>
                                                <span className="text-sm">Sélectionnez une date pour voir la disponibilité</span>
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-gray-500">
                                            Cliquez sur différentes dates pour voir la disponibilité du professeur
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Time Slot Selection */}
                                <div className="order-1 lg:order-2">
                                    <h4 className="font-bold text-lg mb-4 text-center text-blue-600 flex items-center justify-center gap-2">
                                        <span className="text-xl">⏰</span>
                                        Sélection des créneaux horaires
                                    </h4>

                                    {selectedDates.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-3">📅</div>
                                            <p className="text-lg text-gray-600 mb-2">
                                                Sélectionnez une date pour voir les créneaux disponibles
                                            </p>
                                            <p className="text-gray-500">
                                                Choisissez d'abord vos dates dans le calendrier à gauche
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-600 mb-4 text-center text-base">
                                                Choisissez un créneau pour chaque session
                                            </p>

                                            <div className="space-y-3">
                                                {selectedDates.map((date, index) => {
                                                    const dayKey = format(date, 'EEEE').toLowerCase();
                                                    const availability = teacherAvailability.find(a => a.day === dayKey);
                                                    const dateStr = format(date, 'yyyy-MM-dd');
                                                    // Use teacher's general availability, remove only conflicting sessions
                                                    let timeSlotsForDate = availability?.timeSlots || [];

                                                    // Check for conflicts with existing sessions and remove them
                                                    if (sessionBasedAvailability[dateStr] && sessionBasedAvailability[dateStr].length > 0) {
                                                        console.log(`🔍 [Conflict Check] Found ${sessionBasedAvailability[dateStr].length} existing sessions for ${dateStr}`);

                                                        // Remove slots that conflict with existing sessions
                                                        timeSlotsForDate = timeSlotsForDate.filter(slot => {
                                                            const slotStart = slot.start;
                                                            const slotEnd = slot.end;

                                                            // Check if this slot conflicts with any existing session
                                                            const hasConflict = sessionBasedAvailability[dateStr].some((session: any) => {
                                                                const sessionStart = new Date(session.startTime);
                                                                const sessionEnd = new Date(session.endTime);

                                                                // Convert session times to time strings for comparison
                                                                const sessionStartTime = sessionStart.toTimeString().substring(0, 5); // "11:00"
                                                                const sessionEndTime = sessionEnd.toTimeString().substring(0, 5);   // "12:00"

                                                                // Convert slot times to time strings for comparison
                                                                const slotStartTime = slotStart; // "09:00"
                                                                const slotEndTime = slotEnd;     // "10:00"

                                                                // Check for overlap (same time slot)
                                                                const isSameSlot = slotStartTime === sessionStartTime && slotEndTime === sessionEndTime;

                                                                if (isSameSlot) {
                                                                    console.log(`🔍 [Conflict Check] Blocking slot ${slotStart} - ${slotEnd} (conflicts with existing session ${sessionStartTime} - ${sessionEndTime}, Status: ${session.status})`);
                                                                }

                                                                return isSameSlot;
                                                            });

                                                            return !hasConflict;
                                                        });

                                                        console.log(`🔍 [Conflict Check] Original: ${availability?.timeSlots?.length || 0}, After filtering: ${timeSlotsForDate.length}`);
                                                    } else {
                                                        console.log(`🔍 [Availability] No existing sessions for ${dateStr}, using all ${availability?.timeSlots?.length || 0} slots`);
                                                    }

                                                    // Debug logging
                                                    console.log(`🔍 [Time Slot Selection] Using GENERAL availability for ${dateStr}:`, availability?.timeSlots);

                                                    return (
                                                        <Card key={index} className="p-4 border-2 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg">
                                                            <div className="text-center mb-3">
                                                                <h5 className="text-lg font-bold text-gray-800 mb-1">
                                                                    Session {index + 1}
                                                                </h5>
                                                                <p className="text-base text-blue-600 font-medium">
                                                                    {format(date, 'EEEE d MMMM', { locale: fr })}
                                                                </p>
                                                            </div>

                                                            {timeSlotsForDate.length === 0 ? (
                                                                <div className="text-center py-3">
                                                                    <p className="text-gray-500 text-base">Aucun créneau disponible pour cette date.</p>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {timeSlotsForDate.map((slot, slotIndex) => {
                                                                        // Debug: Log the slot structure
                                                                        console.log(`🔍 [Slot Debug] Slot ${slotIndex}:`, slot);
                                                                        console.log(`🔍 [Slot Debug] slot.start type:`, typeof slot.start);

                                                                        // Format the time slot properly - handle both Date objects and strings
                                                                        let timeSlotString = '';
                                                                        // Always treat as string and parse if needed
                                                                        if (typeof slot.start === 'string' && typeof slot.end === 'string') {
                                                                            // Session availability returns ISO date strings - parse them!
                                                                            try {
                                                                                const startDate = new Date(slot.start);
                                                                                const endDate = new Date(slot.end);

                                                                                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                                                                                    const startTime = startDate.toLocaleTimeString('fr-FR', {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                        hour12: false
                                                                                    });
                                                                                    const endTime = endDate.toLocaleTimeString('fr-FR', {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                        hour12: false
                                                                                    });
                                                                                    timeSlotString = `${startTime} - ${endTime}`;
                                                                                    console.log(`🔍 [Slot Debug] Formatted ISO string: ${timeSlotString}`);
                                                                                } else {
                                                                                    timeSlotString = `${slot.start} - ${slot.end}`;
                                                                                    console.log(`🔍 [Slot Debug] Using raw slot times: ${timeSlotString}`);
                                                                                }
                                                                            } catch (error) {
                                                                                timeSlotString = `${slot.start} - ${slot.end}`;
                                                                                console.log(`🔍 [Slot Debug] Using raw slot times after error: ${timeSlotString}`);
                                                                            }
                                                                        } else {
                                                                            // Fallback - try to format whatever we have
                                                                            // Try to parse as Date if it's a string that looks like a date
                                                                            try {
                                                                                const startDate = new Date(slot.start);
                                                                                const endDate = new Date(slot.end);

                                                                                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                                                                                    const startTime = startDate.toLocaleTimeString('fr-FR', {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                        hour12: false
                                                                                    });
                                                                                    const endTime = endDate.toLocaleTimeString('fr-FR', {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                        hour12: false
                                                                                    });
                                                                                    timeSlotString = `${startTime} - ${endTime}`;
                                                                                    console.log(`🔍 [Slot Debug] Parsed as Date string: ${timeSlotString}`);
                                                                                } else {
                                                                                    timeSlotString = `${slot.start} - ${slot.end}`;
                                                                                    console.log(`🔍 [Slot Debug] Using raw slot times: ${timeSlotString}`);
                                                                                }
                                                                            } catch (error) {
                                                                                timeSlotString = `${slot.start} - ${slot.end}`;
                                                                                console.log(`🔍 [Slot Debug] Using raw slot times after error: ${timeSlotString}`);
                                                                            }
                                                                        }

                                                                        const isSelected = selectedTimeSlots[index]?.timeSlot === timeSlotString;
                                                                        return (
                                                                            <Button
                                                                                key={slotIndex}
                                                                                variant={isSelected ? "default" : "outline"}
                                                                                onClick={() => {
                                                                                    const newSelectedTimeSlots = [...selectedTimeSlots];
                                                                                    newSelectedTimeSlots[index] = { date, timeSlot: timeSlotString };
                                                                                    setSelectedTimeSlots(newSelectedTimeSlots);
                                                                                }}
                                                                                className={`w-full h-10 text-sm font-semibold ${isSelected
                                                                                    ? 'bg-blue-600 text-white shadow-xl scale-105 border-2 border-blue-700'
                                                                                    : 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                                                                                    } transition-all duration-300`}
                                                                            >
                                                                                {timeSlotString}
                                                                            </Button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {selectedTimeSlots[index] && (
                                                                <div className="mt-3 p-2 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                                                                    <span className="text-green-800 font-bold text-base flex items-center justify-center gap-2">
                                                                        <span className="text-lg">✅</span>
                                                                        Créneau sélectionné : {selectedTimeSlots[index].timeSlot}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Section - Compact Version */}
                        {selectedDates.length > 0 && selectedTimeSlots.length === selectedDates.length && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg">
                                <div className="text-center mb-4">
                                    <h4 className="font-bold text-xl text-blue-800 flex items-center justify-center gap-2 mb-1">
                                        <span className="text-2xl">🎯</span>
                                        Récapitulatif de votre réservation
                                    </h4>
                                    <p className="text-blue-600 font-medium text-sm">
                                        Vérifiez vos sélections avant de continuer
                                    </p>
                                </div>

                                <div className="max-w-2xl mx-auto">
                                    <div className="grid gap-3">
                                        {selectedTimeSlots.map((slot, index) => (
                                            <div key={index} className="bg-white rounded-lg border-2 border-blue-100 shadow-sm p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-800 text-base">
                                                                Session {index + 1}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {format(slot.date, 'EEEE', { locale: fr })} • {format(slot.date, 'd MMMM yyyy', { locale: fr })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-blue-600 text-base">
                                                            {slot.timeSlot}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {format(slot.date, 'dd/MM')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Summary */}
                                    <div className="mt-4 p-3 bg-blue-100 border-2 border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">📋</span>
                                                <span className="font-bold text-blue-800 text-base">
                                                    Total des sessions
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-blue-600 text-xl">
                                                    {selectedTimeSlots.length}
                                                </div>
                                                <div className="text-xs text-blue-600">
                                                    session{selectedTimeSlots.length > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons - Always Visible */}
                        <div className="flex justify-between gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep('course-details')}
                                className="px-6 py-2 text-base font-medium border-2 hover:border-blue-300"
                            >
                                ← Retour
                            </Button>
                            <Button
                                onClick={() => setCurrentStep('payment')}
                                disabled={selectedDates.length !== courseDurationWeeks || selectedTimeSlots.length !== courseDurationWeeks}
                                className="bg-blue-600 hover:bg-blue-700 px-8 py-2 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {selectedTimeSlots.length === selectedDates.length ? (
                                    <>
                                        💳 Continuer vers le paiement
                                    </>
                                ) : (
                                    <>
                                        ⏳ Sélectionnez tous les créneaux
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 'payment' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2">Paiement sécurisé</h3>
                            <p className="text-gray-600">Finalisez votre inscription en effectuant le paiement</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Order Summary */}
                            <div className="space-y-4">
                                <Card className="p-4">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Lock className="h-5 w-5 text-green-600" />
                                            Récapitulatif de la commande
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium">Cours: {course.title}</span>
                                            <span className="font-bold text-lg">{course.price}€</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium">Nombre de sessions</span>
                                            <span className="font-bold">{courseDurationWeeks} sessions</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium">Créneaux sélectionnés</span>
                                            <span className="font-bold text-sm text-right">
                                                {selectedTimeSlots.map((slot, index) => (
                                                    <div key={index}>
                                                        {format(slot.date, 'dd/MM')} • {slot.timeSlot}
                                                    </div>
                                                ))}
                                            </span>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                                <span className="text-lg font-semibold">Total à payer</span>
                                                <span className="text-2xl font-bold text-primary">{course.price}€</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Security Info */}
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <strong>🔒 Paiement sécurisé</strong><br />
                                        Vos informations de paiement sont protégées par le cryptage SSL et Stripe.<br />
                                        Aucune donnée de carte n'est stockée sur nos serveurs.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Credit Card Form */}
                            <div>
                                <Card className="p-4">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                            Informations de paiement
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Elements stripe={stripePromise}>
                                            <StripePaymentForm
                                                course={course}
                                                selectedDates={selectedDates}
                                                selectedTimeSlots={selectedTimeSlots}
                                                onSuccess={async () => {
                                                    // Create the enrollment after successful payment
                                                    await handleEnrollment();
                                                }}
                                                onError={(error: string) => {
                                                    toast({
                                                        title: "Erreur de paiement",
                                                        description: error,
                                                        variant: "destructive"
                                                    });
                                                }}
                                            />
                                        </Elements>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-between gap-3 pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep('time-booking')}>Retour</Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 'confirmation' && (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-3">Inscription réussie ! 🎉</h3>
                            <p className="text-lg text-gray-600">Félicitations ! Vous êtes maintenant inscrit au cours "{course.title}"</p>
                        </div>

                        <Card className="max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle>Détails de vos sessions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {selectedDates.map((date, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{format(date, 'EEEE d MMMM', { locale: fr })}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Session {index + 1} • {selectedTimeSlots[index]?.timeSlot || 'Créneau à définir'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Button onClick={handleClose} className="w-full max-w-md mx-auto bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Parfait ! Fermer
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CourseEnrollmentModal;
