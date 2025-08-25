import { api, APIResponse } from './api';
import { Course, PaginatedResponse } from './types';

export interface CourseFilters {
    category?: string;
    level?: string;
    price?: 'free' | 'paid';
    instructor?: string;
    search?: string;
    status?: 'published' | 'draft' | 'archived';
}

export interface CourseEnrollmentData {
    courseId: string;
    userId: string;
}

export const courseService = {
    // Get all available courses with filters
    getAvailableCourses: async (filters?: CourseFilters): Promise<Course[]> => {
        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }

        const response = await api.get(`/api/courses?${params.toString()}`);
        return response.data;
    },

    // Get course by ID
    getCourseById: async (courseId: string): Promise<Course> => {
        const response = await api.get(`/api/courses/${courseId}`);
        return response.data;
    },

    // Get courses by instructor
    getCoursesByInstructor: async (instructorId: string): Promise<Course[]> => {
        const response = await api.get(`/api/courses?instructor=${instructorId}&limit=100`);
        return response.data.data; // Note: data.data because the response has pagination structure
    },

    // Get popular courses
    getPopularCourses: async (limit: number = 10): Promise<Course[]> => {
        const response = await api.get(`/api/courses/popular?limit=${limit}`);
        return response.data;
    },

    // Get featured courses
    getFeaturedCourses: async (limit: number = 6): Promise<Course[]> => {
        const response = await api.get(`/api/courses/featured?limit=${limit}`);
        return response.data;
    },

    // Search courses
    searchCourses: async (query: string, filters?: CourseFilters): Promise<Course[]> => {
        const params = new URLSearchParams({ q: query });

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }

        const response = await api.get(`/api/courses/search?${params.toString()}`);
        return response.data;
    },

    // Enroll in course
    enrollInCourse: async (courseId: string, userId: string): Promise<APIResponse> => {
        const response = await api.post('/api/courses/enroll', {
            courseId,
            userId
        });
        return response;
    },

    // Unenroll from course
    unenrollFromCourse: async (courseId: string, userId: string): Promise<APIResponse> => {
        const response = await api.delete(`/api/courses/${courseId}/enroll?userId=${userId}`);
        return response;
    },

    // Get course progress
    getCourseProgress: async (courseId: string, userId: string): Promise<number> => {
        const response = await api.get(`/api/courses/${courseId}/progress?userId=${userId}`);
        return response.data.progress;
    },

    // Update course progress
    updateCourseProgress: async (courseId: string, userId: string, progress: number): Promise<APIResponse> => {
        const response = await api.patch(`/api/courses/${courseId}/progress`, {
            userId,
            progress
        });
        return response;
    },

    // Get course reviews
    getCourseReviews: async (courseId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<any>> => {
        const response = await api.get(`/api/courses/${courseId}/reviews?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Add course review
    addCourseReview: async (courseId: string, reviewData: {
        rating: number;
        comment?: string;
    }): Promise<APIResponse> => {
        const response = await api.post(`/api/courses/${courseId}/reviews`, reviewData);
        return response;
    },

    // Get course syllabus
    getCourseSyllabus: async (courseId: string): Promise<any> => {
        const response = await api.get(`/courses/${courseId}/syllabus`);
        return response.data;
    },

    // Get course lessons
    getCourseLessons: async (courseId: string): Promise<any[]> => {
        const response = await api.get(`/courses/${courseId}/lessons`);
        return response.data;
    },

    // Get lesson content
    getLessonContent: async (courseId: string, lessonId: string): Promise<any> => {
        const response = await api.get(`/courses/${courseId}/lessons/${lessonId}`);
        return response.data;
    },

    // Mark lesson as completed
    markLessonCompleted: async (courseId: string, lessonId: string, userId: string): Promise<APIResponse> => {
        const response = await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`, {
            userId
        });
        return response;
    },

    // Get course analytics
    getCourseAnalytics: async (courseId: string): Promise<any> => {
        const response = await api.get(`/courses/${courseId}/analytics`);
        return response.data;
    },

    // Get course certificate
    getCourseCertificate: async (courseId: string, userId: string): Promise<any> => {
        const response = await api.get(`/courses/${courseId}/certificate?userId=${userId}`);
        return response.data;
    },

    // Download course certificate
    downloadCertificate: async (courseId: string, userId: string): Promise<Blob> => {
        const response = await api.get(`/courses/${courseId}/certificate/download?userId=${userId}`);
        return response.blob();
    },

    // Get course recommendations
    getCourseRecommendations: async (userId: string, limit: number = 6): Promise<Course[]> => {
        const response = await api.get(`/courses/recommendations?userId=${userId}&limit=${limit}`);
        return response.data;
    },

    // Get course categories
    getCourseCategories: async (): Promise<any[]> => {
        const response = await api.get('/courses/categories');
        return response.data;
    },

    // Get course levels
    getCourseLevels: async (): Promise<string[]> => {
        const response = await api.get('/courses/levels');
        return response.data;
    },

    // Get course pricing
    getCoursePricing: async (courseId: string): Promise<any> => {
        const response = await api.get(`/courses/${courseId}/pricing`);
        return response.data;
    },

    // Purchase course
    purchaseCourse: async (courseId: string, paymentData: any): Promise<APIResponse> => {
        const response = await api.post(`/courses/${courseId}/purchase`, paymentData);
        return response;
    },

    // Get course preview
    getCoursePreview: async (courseId: string): Promise<any> => {
        const response = await api.get(`/courses/${courseId}/preview`);
        return response.data;
    },

    // Add course to wishlist
    addToWishlist: async (courseId: string, userId: string): Promise<APIResponse> => {
        const response = await api.post('/wishlist/add', {
            courseId,
            userId
        });
        return response;
    },

    // Remove course from wishlist
    removeFromWishlist: async (courseId: string, userId: string): Promise<APIResponse> => {
        const response = await api.delete(`/wishlist/remove?courseId=${courseId}&userId=${userId}`);
        return response;
    },

    // Get user wishlist
    getUserWishlist: async (userId: string): Promise<Course[]> => {
        const response = await api.get(`/wishlist?userId=${userId}`);
        return response.data;
    }
}; 