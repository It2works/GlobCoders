import { api, APIResponse, API_BASE_URL } from './api';
import { Quiz, QuizAttempt, Question } from './types';

export interface QuizFilters {
    courseId?: string;
    teacherId?: string;
    isPublished?: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
}

export interface QuizAttemptData {
    quizId: string;
    studentId: string;
    answers: Array<{
        questionIndex: number;
        answer: any;
    }>;
    timeSpent?: number;
}

export const quizService = {
    // Get all quizzes
    getQuizzes: async (filters?: QuizFilters): Promise<Quiz[]> => {
        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    if (value instanceof Date) {
                        params.append(key, value.toISOString());
                    } else {
                        params.append(key, value.toString());
                    }
                }
            });
        }

        const response = await api.get(`/api/quizzes?${params.toString()}`);
        return response.data;
    },

    // Get quiz by ID
    getQuizById: async (quizId: string): Promise<Quiz> => {
        const response = await api.get(`/api/quizzes/${quizId}`);
        return response.data;
    },

    // Get quizzes by course
    getQuizzesByCourse: async (courseId: string): Promise<Quiz[]> => {
        const response = await api.get(`/api/quizzes/course/${courseId}`);
        return response.data;
    },

    // Get quizzes by teacher
    getQuizzesByTeacher: async (teacherId: string): Promise<Quiz[]> => {
        const response = await api.get(`/api/quizzes/teacher/${teacherId}`);
        return response.data;
    },

    // Get available quizzes for student
    getAvailableQuizzes: async (studentId: string): Promise<Quiz[]> => {
        const response = await api.get(`/api/quizzes/available?studentId=${studentId}`);
        return response.data;
    },

    // Get quiz attempts for student
    getQuizAttempts: async (studentId: string): Promise<QuizAttempt[]> => {
        const response = await api.get(`/api/quizzes/attempts?studentId=${studentId}`);
        return response.data;
    },

    // Get quiz attempt by ID
    getQuizAttemptById: async (attemptId: string): Promise<QuizAttempt> => {
        const response = await api.get(`/api/quizzes/attempts/${attemptId}`);
        return response.data;
    },

    // Get quiz attempts for specific quiz
    getQuizAttemptsForQuiz: async (quizId: string, studentId: string): Promise<QuizAttempt[]> => {
        const response = await api.get(`/api/quizzes/${quizId}/attempts?studentId=${studentId}`);
        return response.data;
    },

    // Start quiz attempt
    startQuizAttempt: async (quizId: string, studentId: string): Promise<QuizAttempt> => {
        const response = await api.post('/api/quizzes/attempts/start', {
            quizId,
            studentId
        });
        return response.data;
    },

    // Submit quiz attempt
    submitQuizAttempt: async (attemptData: QuizAttemptData): Promise<APIResponse> => {
        const response = await api.post('/api/quizzes/attempts/submit', attemptData);
        return response;
    },

    // Get quiz results
    getQuizResults: async (attemptId: string): Promise<{
        score: number;
        percentage: number;
        passed: boolean;
        answers: Array<{
            questionIndex: number;
            answer: any;
            isCorrect: boolean;
            points: number;
            correctAnswer?: any;
            explanation?: string;
        }>;
        totalPoints: number;
        earnedPoints: number;
        timeSpent: number;
    }> => {
        const response = await api.get(`/api/quizzes/attempts/${attemptId}/results`);
        return response.data;
    },

    // Get quiz statistics
    getQuizStats: async (quizId: string): Promise<{
        totalAttempts: number;
        averageScore: number;
        passRate: number;
        averageTimeSpent: number;
        questionStats: Array<{
            questionIndex: number;
            correctAnswers: number;
            incorrectAnswers: number;
            averagePoints: number;
        }>;
    }> => {
        const response = await api.get(`/api/quizzes/${quizId}/stats`);
        return response.data;
    },

    // Get student quiz statistics
    getStudentQuizStats: async (studentId: string): Promise<{
        totalQuizzesTaken: number;
        totalQuizzesPassed: number;
        averageScore: number;
        totalStudyTime: number;
        quizHistory: Array<{
            quizId: string;
            quizTitle: string;
            courseTitle: string;
            score: number;
            passed: boolean;
            completedAt: Date;
        }>;
    }> => {
        const response = await api.get(`/api/quizzes/student/${studentId}/stats`);
        return response.data;
    },

    // Get quiz leaderboard
    getQuizLeaderboard: async (quizId: string, limit: number = 10): Promise<Array<{
        studentId: string;
        studentName: string;
        score: number;
        percentage: number;
        timeSpent: number;
        completedAt: Date;
    }>> => {
        const response = await api.get(`/api/quizzes/${quizId}/leaderboard?limit=${limit}`);
        return response.data;
    },

    // Check if student can take quiz
    canTakeQuiz: async (quizId: string, studentId: string): Promise<{
        canTake: boolean;
        reason?: string;
        attemptsRemaining?: number;
        nextAvailableTime?: Date;
    }> => {
        const response = await api.get(`/api/quizzes/${quizId}/can-take?studentId=${studentId}`);
        return response.data;
    },

    // Get quiz preview (without answers)
    getQuizPreview: async (quizId: string): Promise<{
        title: string;
        description: string;
        totalQuestions: number;
        timeLimit: number;
        totalPoints: number;
        passingScore: number;
        questions: Array<{
            questionIndex: number;
            question: string;
            type: string;
            points: number;
            options?: string[];
        }>;
    }> => {
        const response = await api.get(`/api/quizzes/${quizId}/preview`);
        return response.data;
    },

    // Get quiz questions (with answers for review)
    getQuizQuestions: async (quizId: string): Promise<Question[]> => {
        const response = await api.get(`/api/quizzes/${quizId}/questions`);
        return response.data;
    },

    // Save quiz attempt progress
    saveQuizProgress: async (attemptId: string, answers: Array<{
        questionIndex: number;
        answer: any;
    }>): Promise<APIResponse> => {
        const response = await api.patch(`/api/quizzes/attempts/${attemptId}/progress`, {
            answers
        });
        return response;
    },

    // Get quiz attempt progress
    getQuizProgress: async (attemptId: string): Promise<{
        answers: Array<{
            questionIndex: number;
            answer: any;
        }>;
        timeSpent: number;
        lastSaved: Date;
    }> => {
        const response = await api.get(`/api/quizzes/attempts/${attemptId}/progress`);
        return response.data;
    },

    // Resume quiz attempt
    resumeQuizAttempt: async (attemptId: string): Promise<QuizAttempt> => {
        const response = await api.post(`/api/quizzes/attempts/${attemptId}/resume`, {});
        return response.data;
    },

    // Get quiz certificates
    getQuizCertificates: async (studentId: string): Promise<Array<{
        quizId: string;
        quizTitle: string;
        courseTitle: string;
        score: number;
        certificateId: string;
        issuedAt: Date;
    }>> => {
        const response = await api.get(`/api/quizzes/certificates?studentId=${studentId}`);
        return response.data;
    },

    // Download quiz certificate
    downloadQuizCertificate: async (certificateId: string): Promise<Blob> => {
        const response = await fetch(`${API_BASE_URL}/api/quizzes/certificates/${certificateId}/download`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.blob();
    },

    // Get quiz notifications
    getQuizNotifications: async (studentId: string): Promise<Array<{
        quizId: string;
        quizTitle: string;
        type: 'available' | 'reminder' | 'result';
        message: string;
        createdAt: Date;
    }>> => {
        const response = await api.get(`/api/quizzes/notifications?studentId=${studentId}`);
        return response.data;
    },

    // Mark quiz notification as read
    markQuizNotificationAsRead: async (notificationId: string): Promise<APIResponse> => {
        const response = await api.patch(`/api/quizzes/notifications/${notificationId}/read`, {});
        return response;
    },

    // Get quiz recommendations
    getQuizRecommendations: async (studentId: string, limit: number = 5): Promise<Quiz[]> => {
        const response = await api.get(`/api/quizzes/recommendations?studentId=${studentId}&limit=${limit}`);
        return response.data;
    }
}; 