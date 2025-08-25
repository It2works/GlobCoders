// Stripe Configuration for GLOBCODERS
export const STRIPE_CONFIG = {
  // Live API Keys (Production) - from environment variables
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_your_key_here',
  SECRET_KEY: 'SECRET_KEYS_SHOULD_NOT_BE_IN_FRONTEND',

  // Payment Settings
  CURRENCY: 'eur',
  PAYMENT_METHODS: ['card'],

  // Webhook Settings (for production)
  WEBHOOK_ENDPOINT: '/api/stripe/webhook',

  // Test Mode DISABLED - PRODUCTION ONLY
  TEST_MODE: false,

  // Course Enrollment Metadata
  METADATA_KEYS: {
    COURSE_ID: 'courseId',
    TEACHER_ID: 'teacherId',
    STUDENT_ID: 'studentId',
    TIME_SLOT: 'timeSlot',
    DAY_OF_WEEK: 'dayOfWeek',
    DURATION: 'duration',
    PAYMENT_TYPE: 'paymentType'
  }
};

// Stripe Payment Intent Configuration
export const PAYMENT_INTENT_CONFIG = {
  CAPTURE_METHOD: 'automatic',
  CONFIRMATION_METHOD: 'manual',
  SETUP_FUTURE_USAGE: 'off_session',

  // Metadata for course enrollment tracking
  getMetadata: (data: {
    courseId: string;
    teacherId: string;
    studentId: string;
    timeSlot: string;
    dayOfWeek: string;
    duration: number;
  }) => ({
    courseId: data.courseId,
    teacherId: data.teacherId,
    studentId: data.studentId,
    timeSlot: data.timeSlot,
    dayOfWeek: data.dayOfWeek,
    duration: data.duration.toString(),
    paymentType: 'course_enrollment',
    platform: 'globcoders'
  })
};

// Stripe Error Messages (French)
export const STRIPE_ERROR_MESSAGES = {
  CARD_DECLINED: 'Votre carte a été refusée. Veuillez essayer une autre carte.',
  INSUFFICIENT_FUNDS: 'Fonds insuffisants sur votre carte.',
  EXPIRED_CARD: 'Votre carte a expiré.',
  INVALID_CVC: 'Code de sécurité invalide.',
  INVALID_EXPIRY: 'Date d\'expiration invalide.',
  PROCESSING_ERROR: 'Erreur lors du traitement du paiement. Veuillez réessayer.',
  NETWORK_ERROR: 'Erreur de réseau. Vérifiez votre connexion internet.',
  GENERIC_ERROR: 'Une erreur est survenue. Veuillez réessayer.'
};

// Stripe Success Messages (French)
export const STRIPE_SUCCESS_MESSAGES = {
  PAYMENT_SUCCESS: 'Paiement traité avec succès!',
  ENROLLMENT_SUCCESS: 'Inscription au cours confirmée!',
  SESSIONS_CREATED: 'Sessions créées et réservées!'
};
