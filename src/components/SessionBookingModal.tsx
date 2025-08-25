import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar, User, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { AvailableTimeSlots } from './AvailableTimeSlots';
import { STRIPE_CONFIG, PAYMENT_INTENT_CONFIG, STRIPE_ERROR_MESSAGES, STRIPE_SUCCESS_MESSAGES } from '@/config/stripe';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  price: number;
  duration: {
    total: number;
    lectures: number;
  };
}

interface AvailableTimeSlot {
  start: Date;
  end: Date;
  formatted: string;
  isAvailable: boolean;
}

interface SessionBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onEnrollmentSuccess: () => void;
}

export const SessionBookingModal: React.FC<SessionBookingModalProps> = ({
  isOpen,
  onClose,
  course,
  onEnrollmentSuccess
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'time-selection' | 'payment' | 'confirmation'>('time-selection');
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  // Calculate course duration in weeks (assuming 1 session per week)
  const courseDurationWeeks = Math.ceil(course.duration.total / 60); // Convert minutes to weeks

  const handleTimeSlotSelect = (slot: AvailableTimeSlot) => {
    setSelectedSlot(slot);
    setCurrentStep('payment');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePayment = async () => {
    if (!selectedSlot || !selectedDate) return;

    setIsProcessing(true);
    try {
      // Always use real Stripe API for session booking (no test mode)
      const paymentEndpoint = '/api/stripe/create-payment-intent';

      const stripeResponse = await fetch(paymentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: course.price * 100, // Convert to cents
          currency: STRIPE_CONFIG.CURRENCY,
          courseId: course._id,
          metadata: {
            courseId: course._id,
            teacherId: course.instructor._id,
            studentId: 'current-user-id', // Get from auth context
            paymentType: 'session_booking',
            courseTitle: course.title,
            timeSlot: `${format(selectedSlot.start, 'HH:mm')}-${format(selectedSlot.end, 'HH:mm')}`,
            dayOfWeek: format(selectedDate, 'EEEE', { locale: fr }),
            duration: courseDurationWeeks,
            sessionIds: JSON.stringify([]) // Will be populated after session creation
          }
        })
      });

      if (!stripeResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentData = await stripeResponse.json();
      const { clientSecret, paymentIntentId } = paymentData;
      setPaymentIntent({ clientSecret });

      // Step 2: Create all sessions for the course duration FIRST
      const createdSessions = await createCourseSessions();

      // Step 3: Update payment intent with session IDs
      const updateResponse = await fetch('/api/stripe/update-payment-intent-metadata', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          sessionIds: JSON.stringify(createdSessions.map(s => s._id))
        })
      });

      if (!updateResponse.ok) {
        console.warn('Could not update payment intent with session IDs');
      }

      // Step 4: REAL Payment Processing - Payment intent created, now user needs to pay
      console.log('💳 [REAL MODE] Payment intent created successfully');
      console.log('🎯 Payment Intent ID:', paymentIntentId);
      console.log('🔑 Client Secret:', clientSecret);

      // Move to payment step where user will enter card details
      // The payment will be completed via Stripe Elements or external payment flow
      // Webhook will handle the payment completion and session enrollment
      setCurrentStep('payment');

      // Note: Actual payment processing happens via Stripe Elements
      // Webhook will create payment records and enroll user when payment succeeds

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : STRIPE_ERROR_MESSAGES.GENERIC_ERROR;
      toast({
        title: "Erreur de paiement",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createCourseSessions = async () => {
    if (!selectedSlot || !selectedDate) return [];

    try {
      const { SessionService } = await import('@/services/sessions');
      const createdSessions = [];

      // Create sessions for each week of the course
      for (let week = 0; week < courseDurationWeeks; week++) {
        const sessionDate = addWeeks(selectedDate, week);

        const sessionData = {
          title: `${course.title} - Session ${week + 1}`,
          description: `Session ${week + 1} du cours ${course.title}`,
          course: course._id,
          startTime: new Date(sessionDate.getTime() + selectedSlot.start.getTime()),
          endTime: new Date(sessionDate.getTime() + selectedSlot.end.getTime()),
          duration: 60, // 1 hour sessions
          capacity: 1, // Individual sessions
          sessionType: 'live' as const,
          notes: `Session réservée pour ${courseDurationWeeks} semaines`
        };

        const session = await SessionService.createSession(sessionData);
        createdSessions.push(session);

        // Enroll the student in this session
        await SessionService.enrollInSession(session._id);
      }

      toast({
        title: STRIPE_SUCCESS_MESSAGES.SESSIONS_CREATED,
        description: `${courseDurationWeeks} sessions ont été créées et réservées`
      });

      return createdSessions;

    } catch (error) {
      console.error('Error creating sessions:', error);
      throw new Error('Failed to create course sessions');
    }
  };

  const handleClose = () => {
    if (currentStep === 'confirmation') {
      onClose();
    } else {
      setCurrentStep('time-selection');
      setSelectedSlot(null);
      setSelectedDate(null);
      onClose();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'time-selection': return 'Sélectionnez votre créneau horaire';
      case 'payment': return 'Paiement et confirmation';
      case 'confirmation': return 'Inscription réussie! 🎉';
      default: return 'Réservation de session';
    }
  };

  const renderTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          Choisissez votre horaire hebdomadaire
        </h3>
        <p className="text-gray-600">
          Votre créneau sera réservé chaque semaine pendant {courseDurationWeeks} semaines
        </p>
      </div>

      <AvailableTimeSlots
        teacherId={course.instructor._id}
        courseDuration={courseDurationWeeks}
        onTimeSlotSelect={handleTimeSlotSelect}
        selectedDate={selectedDate || undefined}
        onDateSelect={handleDateSelect}
      />
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          Confirmez votre réservation
        </h3>
        <p className="text-gray-600">
          Vérifiez les détails et procédez au paiement
        </p>
      </div>

      {/* Reservation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résumé de votre réservation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Détails du cours</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Titre:</strong> {course.title}</p>
                <p><strong>Formateur:</strong> {course.instructor.firstName} {course.instructor.lastName}</p>
                <p><strong>Durée:</strong> {courseDurationWeeks} semaines</p>
                <p><strong>Prix:</strong> {course.price}€</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Votre horaire</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Jour:</strong> {selectedDate && format(selectedDate, 'EEEE d MMMM', { locale: fr })}</p>
                <p><strong>Heure:</strong> {selectedSlot && `${format(selectedSlot.start, 'HH:mm')} - ${format(selectedSlot.end, 'HH:mm')}`}</p>
                <p><strong>Fréquence:</strong> Hebdomadaire</p>
                <p><strong>Total:</strong> {courseDurationWeeks} sessions</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total à payer:</span>
            <span className="text-blue-600">{course.price}€</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('time-selection')}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Traitement...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Payer {course.price}€
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Félicitations! 🎉
        </h3>
        <p className="text-lg text-gray-600">
          Vous êtes maintenant inscrit au cours "{course.title}"
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Votre créneau est réservé chaque semaine</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Vous recevrez des rappels avant chaque session</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              <span>Votre formateur vous contactera bientôt</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleClose} className="w-full">
        Fermer
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep === 'time-selection' && <Calendar className="w-5 h-5" />}
            {currentStep === 'payment' && <CreditCard className="w-5 h-5" />}
            {currentStep === 'confirmation' && <CheckCircle className="w-5 h-5" />}
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 'time-selection' && renderTimeSelection()}
          {currentStep === 'payment' && renderPayment()}
          {currentStep === 'confirmation' && renderConfirmation()}
        </div>
      </DialogContent>
    </Dialog>
  );
};