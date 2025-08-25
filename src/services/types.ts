// Base types
export interface BaseEntity {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
    firstName: string;
    lastName: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    avatar?: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    preferences?: {
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        theme: 'light' | 'dark' | 'system';
    };
    // Teacher-specific fields
    expertise?: string[];
    experience?: number;
    hourlyRate?: number;
    availability?: Array<{
        day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
        enabled: boolean;
        timeSlots: Array<{
            start: string;
            end: string;
        }>;
    }>;
    rating?: {
        average: number;
        count: number;
    };
    presentationVideo?: string;
    teacherApprovalStatus?: 'pending' | 'approved' | 'rejected';
    teacherApprovalDate?: Date;
    teacherApprovalBy?: string;
    teacherRejectionReason?: string;
    teacherApprovalNotes?: string;
    // Admin certificate fields
    adminCertificate?: {
        certificateFile?: string;
        certificateHash?: string;
        verified: boolean;
        verifiedAt?: Date;
        verifiedBy?: string;
        certificateData?: {
            commonName?: string;
            organization?: string;
            issuer?: string;
            validFrom?: Date;
            validTo?: Date;
            serialNumber?: string;
        };
    };
    // Student-specific fields
    enrolledCourses?: Enrollment[];
    certificates?: Certificate[];
    // Security and verification
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    // Account status
    isActive: boolean;
    isBlocked: boolean;
    blockedReason?: string;
    blockedAt?: Date;
    blockedBy?: string;
    // Login tracking
    lastLoginAt?: Date;
    loginAttempts: number;
    lockUntil?: Date;
}

// Course types
export interface Course extends BaseEntity {
    title: string;
    description: string;
    shortDescription?: string;
    thumbnail: string;
    images?: string[];
    video?: {
        url?: string;
        duration?: number;
        thumbnails?: string[];
    };
    instructor: User;
    category: 'programming' | 'design' | 'business' | 'marketing' | 'music' | 'photography' | 'cooking' | 'fitness' | 'language' | 'other';
    subcategory?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    price: number;
    originalPrice?: number;
    discount?: {
        percentage: number;
        validUntil: Date;
    };
    duration: {
        total: number;
        lectures: number;
    };
    syllabus?: SyllabusItem[];
    prerequisites?: string[];
    learningOutcomes?: string[];
    targetAudience?: string[];
    tags?: string[];
    requirements?: string[];
    // Course stats
    enrollmentCount: number;
    rating: {
        average: number;
        count: number;
        distribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    };
    reviews?: Review[];
    // Course status
    status: 'draft' | 'pending' | 'published' | 'archived';
    isPublished: boolean;
    publishedAt?: Date;
    // Course settings
    settings: {
        allowReviews: boolean;
        allowQA: boolean;
        certificateEnabled: boolean;
        autoApprove: boolean;
    };
    // SEO
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        slug?: string;
    };
    // Analytics
    analytics?: {
        views: number;
        completionRate: number;
        averageWatchTime: number;
    };
}

// Syllabus types
export interface SyllabusItem {
    title: string;
    description?: string;
    duration: number;
    order: number;
    lessons: Lesson[];
}

export interface Lesson {
    title: string;
    description?: string;
    content: string;
    videoUrl?: string;
    resources?: Resource[];
    duration: number;
    order: number;
    isPreview: boolean;
}

export interface Resource {
    title: string;
    url: string;
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link' | 'image';
}

// Review types
export interface Review {
    user: User;
    rating: number;
    comment?: string;
    helpful?: string[];
    createdAt: Date;
}

// Enrollment types
export interface Enrollment extends BaseEntity {
    student: string; // User ID
    course: Course; // Populated course object
    enrolledAt: Date;
    status: 'active' | 'completed' | 'cancelled' | 'expired';
    progress: number;
    completed: boolean;
    completedAt?: Date;
    lastAccessedAt?: Date;
    certificate?: Certificate;
}

// Certificate types
export interface Certificate extends BaseEntity {
    course: Course;
    certificateId: string;
    issuedAt: Date;
    verified: boolean;
    certificateUrl?: string;
}

// Quiz types
export interface Question {
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer: any;
    points: number;
    explanation?: string;
}

export interface Quiz extends BaseEntity {
    title: string;
    description: string;
    course: Course;
    teacher: User;
    questions: Question[];
    totalPoints: number;
    timeLimit: number;
    attempts: number;
    passingScore: number;
    isPublished: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
    randomizeQuestions: boolean;
    showResults: boolean;
}

export interface QuizAttempt extends BaseEntity {
    quiz: Quiz;
    student: User;
    answers: Array<{
        questionIndex: number;
        answer: any;
        isCorrect: boolean;
        points: number;
    }>;
    score: number;
    percentage: number;
    passed: boolean;
    startedAt: Date;
    submittedAt?: Date;
    timeSpent?: number;
}

// Notification types
export interface Notification extends BaseEntity {
    recipient: string; // User ID
    sender?: string; // User ID
    type: 'course_enrollment' | 'session_reminder' | 'quiz_available' | 'assignment_due' | 'grade_published' | 'payment_success' | 'payment_failed' | 'message_received' | 'system_announcement' | 'course_update';
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    readAt?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    expiresAt?: Date;
}

// Custom Notification interface for components that expect different property names
export interface CustomNotification extends BaseEntity {
    user_id: string; // User ID (for backward compatibility)
    titre: string; // Title in French
    message: string;
    statut: 'lue' | 'non_lue'; // Status in French
    type: 'alerte' | 'info' | 'success' | 'warning';
    redirect_url?: string;
    createdAt: Date;
}

// Payment types
export interface Payment extends BaseEntity {
    user_id: string; // User ID
    course_id?: string; // Course ID
    amount: number;
    currency: string;
    status: 'en_attente' | 'reussi' | 'echec' | 'rembourse';
    payment_method: string;
    transaction_id: string;
    description: string;
}

// Session types - Updated to match backend model
export interface Session extends BaseEntity {
    title: string;
    description: string;
    teacher: string; // Teacher ID (ObjectId)
    course: string; // Course ID (ObjectId)
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
    capacity: number;
    enrolled: Array<{
        student: string; // Student ID (ObjectId)
        enrolledAt: Date;
        attendance: 'pending' | 'present' | 'absent';
    }>;
    sessionType: 'live' | 'recorded' | 'hybrid';
    meetingLink?: string;
    recordingUrl?: string;
    materials?: Array<{
        name: string;
        url: string;
        type: string;
    }>;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    notes?: string;
}

// Legacy Session interface for backward compatibility (deprecated)
export interface LegacySession extends BaseEntity {
    cours_id: string; // Course ID
    formateur_id: string; // Teacher ID
    eleve_id: string; // Student ID
    date: Date;
    heure: string;
    etat: 'en_attente' | 'accepte' | 'refuse';
    lien_zoom?: string;
    alternatives?: Array<{
        date: Date;
        heure: string;
    }>;
}

// Teacher Availability interface
export interface TeacherAvailability {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    enabled: boolean;
    timeSlots: Array<{
        start: string; // HH:MM format
        end: string; // HH:MM format
    }>;
}

// Available Time Slot interface
export interface AvailableTimeSlot {
    start: Date;
    end: Date;
    formatted: string; // HH:MM format
}

// Session Creation Request
export interface CreateSessionRequest {
    title: string;
    description: string;
    course: string; // Course ID
    startTime: Date;
    endTime: Date;
    duration: number;
    capacity?: number;
    sessionType?: 'live' | 'recorded' | 'hybrid';
    meetingLink?: string;
    notes?: string;
}

// Session Enrollment Request
export interface EnrollSessionRequest {
    sessionId: string;
}

// Session Attendance Update
export interface UpdateAttendanceRequest {
    sessionId: string;
    studentId: string;
    attendance: 'pending' | 'present' | 'absent';
}

// Media types
export interface Media extends BaseEntity {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedBy: string; // User ID
    type: 'image' | 'video' | 'document' | 'audio';
    metadata?: any;
}

// Chat types
export interface ChatMessage extends BaseEntity {
    sender: string; // User ID
    recipient: string; // User ID
    content: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    isRead: boolean;
    readAt?: Date;
    attachments?: string[];
}

// Dashboard stats types
export interface DashboardStats {
    totalCourses: number;
    enrolledCourses: number;
    completedCourses: number;
    totalProgress: number;
    certificates: number;
    quizzesPassed: number;
    totalStudyTime: number;
    currentStreak: number;
}

// API Response types
export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
} 