import { api, APIResponse, API_BASE_URL } from './api';
import { Enrollment, Course } from './types';

export interface EnrollmentData {
    courseId: string;
    userId: string;
}

export interface ProgressUpdateData {
    courseId: string;
    userId: string;
    progress: number;
    lessonId?: string;
}

export const enrollmentService = {
    // Get user enrollments
    getUserEnrollments: async (userId: string): Promise<Enrollment[]> => {
        const response = await api.get(`/api/users/${userId}/enrollments`);
        return response.data;
    },

    // Get enrollment by ID
    getEnrollmentById: async (enrollmentId: string): Promise<Enrollment> => {
        const response = await api.get(`/api/enrollments/${enrollmentId}`);
        return response.data;
    },

    // Get enrollment by course and user
    getEnrollmentByCourse: async (courseId: string, userId: string): Promise<Enrollment | null> => {
        try {
            const response = await api.get(`/api/enrollments/course/${courseId}/user/${userId}`);
            return response.data;
        } catch (error) {
            return null; // Enrollment doesn't exist
        }
    },

    // Create new enrollment
    createEnrollment: async (enrollmentData: EnrollmentData): Promise<APIResponse> => {
        const response = await api.post('/api/enrollments', enrollmentData);
        return response;
    },

    // Update enrollment
    updateEnrollment: async (enrollmentId: string, updateData: Partial<Enrollment>): Promise<APIResponse> => {
        const response = await api.patch(`/api/enrollments/${enrollmentId}`, updateData);
        return response;
    },

    // Delete enrollment
    deleteEnrollment: async (enrollmentId: string): Promise<APIResponse> => {
        const response = await api.delete(`/api/enrollments/${enrollmentId}`);
        return response;
    },

    // Update enrollment progress
    updateProgress: async (progressData: ProgressUpdateData): Promise<APIResponse> => {
        const response = await api.patch('/api/enrollments/progress', progressData);
        return response;
    },

    // Get enrollment progress
    getProgress: async (courseId: string, userId: string): Promise<number> => {
        const response = await api.get(`/api/enrollments/progress?courseId=${courseId}&userId=${userId}`);
        return response.data.progress;
    },

    // Mark course as completed
    markCourseCompleted: async (courseId: string, userId: string): Promise<APIResponse> => {
        const response = await api.post(`/api/enrollments/${courseId}/complete`, {
            userId
        });
        return response;
    },

    // Get completed courses
    getCompletedCourses: async (userId: string): Promise<Enrollment[]> => {
        const response = await api.get(`/api/enrollments/completed?userId=${userId}`);
        return response.data;
    },

    // Get in-progress courses
    getInProgressCourses: async (userId: string): Promise<Enrollment[]> => {
        const response = await api.get(`/api/enrollments/in-progress?userId=${userId}`);
        return response.data;
    },

    // Get enrollment statistics
    getEnrollmentStats: async (userId: string): Promise<{
        totalEnrollments: number;
        completedCourses: number;
        inProgressCourses: number;
        averageProgress: number;
        totalStudyTime: number;
    }> => {
        const response = await api.get(`/api/enrollments/stats?userId=${userId}`);
        return response.data;
    },

    // Get recent enrollments
    getRecentEnrollments: async (userId: string, limit: number = 5): Promise<Enrollment[]> => {
        const response = await api.get(`/api/enrollments/recent?userId=${userId}&limit=${limit}`);
        return response.data;
    },

    // Get enrollment history
    getEnrollmentHistory: async (userId: string, page: number = 1, limit: number = 10): Promise<{
        enrollments: Enrollment[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }> => {
        const response = await api.get(`/api/enrollments/history?userId=${userId}&page=${page}&limit=${limit}`);
        return response.data;
    },

    // Check if user is enrolled
    isUserEnrolled: async (courseId: string, userId: string): Promise<boolean> => {
        try {
            const enrollment = await enrollmentService.getEnrollmentByCourse(courseId, userId);
            return enrollment !== null;
        } catch (error) {
            return false;
        }
    },

    // Get enrollment certificate
    getEnrollmentCertificate: async (enrollmentId: string): Promise<any> => {
        const response = await api.get(`/api/enrollments/${enrollmentId}/certificate`);
        return response.data;
    },

    // Download enrollment certificate
    downloadEnrollmentCertificate: async (enrollmentId: string): Promise<Blob> => {
        const response = await fetch(`${API_BASE_URL}/api/enrollments/${enrollmentId}/certificate/download`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.blob();
    },

    // Get enrollment analytics
    getEnrollmentAnalytics: async (userId: string): Promise<{
        courseProgress: Array<{
            courseId: string;
            courseTitle: string;
            progress: number;
            lastAccessed: Date;
        }>;
        studyTime: Array<{
            date: string;
            minutes: number;
        }>;
        completionRate: number;
        averageScore: number;
    }> => {
        const response = await api.get(`/api/enrollments/analytics?userId=${userId}`);
        return response.data;
    },

    // Update last accessed time
    updateLastAccessed: async (courseId: string, userId: string): Promise<APIResponse> => {
        const response = await api.patch(`/api/enrollments/last-accessed`, {
            courseId,
            userId
        });
        return response;
    },

    // Get course recommendations based on enrollments
    getRecommendations: async (userId: string, limit: number = 6): Promise<Course[]> => {
        const response = await api.get(`/api/enrollments/recommendations?userId=${userId}&limit=${limit}`);
        return response.data;
    },

    // Bulk operations
    bulkUpdateProgress: async (updates: ProgressUpdateData[]): Promise<APIResponse> => {
        const response = await api.post('/api/enrollments/bulk-update-progress', { updates });
        return response;
    },

    // Export enrollment data
    exportEnrollmentData: async (userId: string, format: 'csv' | 'json' = 'json'): Promise<Blob> => {
        const response = await fetch(`${API_BASE_URL}/api/enrollments/export?userId=${userId}&format=${format}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.blob();
    },

    // Get enrollment notifications
    getEnrollmentNotifications: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/api/enrollments/notifications?userId=${userId}`);
        return response.data;
    },

    // Mark enrollment notification as read
    markNotificationAsRead: async (notificationId: string): Promise<APIResponse> => {
        const response = await api.patch(`/api/enrollments/notifications/${notificationId}/read`, {});
        return response;
    }
}; 