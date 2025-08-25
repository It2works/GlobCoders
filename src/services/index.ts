// Export all services
export { api, API_BASE_URL } from './api';
export type { APIError, APIResponse } from './api';
export { courseService } from './courses';
export { enrollmentService } from './enrollments';
export { quizService } from './quizzes';
export { notificationService } from './notifications';
export { userService } from './users';
export { chatService } from './chat';
export type {
    ChatMessage,
    ChatParticipant,
    ChatConversation,
    ChatFilters,
    SendMessageData,
    CreateConversationData
} from './chat';

// Export service types
export type {
    CourseFilters,
    CourseEnrollmentData
} from './courses';

export type {
    EnrollmentData,
    ProgressUpdateData
} from './enrollments';

export type {
    QuizFilters,
    QuizAttemptData
} from './quizzes';

export type {
    NotificationFilters,
    NotificationData
} from './notifications';

export type {
    UserUpdateData
} from './users';

export * from './types'; 