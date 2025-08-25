import { api, APIResponse, API_BASE_URL } from './api';
import { User, DashboardStats } from './types';

export interface UserUpdateData {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    phone?: string;
    avatar?: string;
    preferences?: {
        language?: string;
        timezone?: string;
        notifications?: {
            email?: boolean;
            push?: boolean;
            sms?: boolean;
        };
        theme?: 'light' | 'dark' | 'system';
    };
}

export const userService = {
    // Get current user
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },

    // Get user by ID
    getUserById: async (userId: string): Promise<User> => {
        const response = await api.get(`/api/users/${userId}`);
        return response.data;
    },

    // Update user profile
    updateProfile: async (userId: string, updateData: UserUpdateData): Promise<APIResponse> => {
        const response = await api.patch(`/api/users/${userId}`, updateData);
        return response;
    },

    // Update user avatar
    updateAvatar: async (userId: string, avatarFile: File): Promise<APIResponse> => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const response = await api.post(`/api/users/${userId}/avatar`, formData);
        return response;
    },

    // Get user dashboard stats
    getDashboardStats: async (userId: string): Promise<DashboardStats> => {
        const response = await api.get(`/api/users/${userId}/dashboard-stats`);
        return response.data;
    },

    // Get user enrollments
    getUserEnrollments: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/api/users/${userId}/enrollments`);
        return response.data;
    },

    // Get user certificates
    getUserCertificates: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/api/users/${userId}/certificates`);
        return response.data;
    },

    // Get user quiz attempts
    getUserQuizAttempts: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/api/users/${userId}/quiz-attempts`);
        return response.data;
    },

    // Get user notifications
    getUserNotifications: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/api/users/${userId}/notifications`);
        return response.data;
    },

    // Get user payments
    getUserPayments: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/api/users/${userId}/payments`);
        return response.data;
    },

    // Get user sessions
    getUserSessions: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/api/users/${userId}/sessions`);
        return response.data;
    },

    // Get user analytics
    getUserAnalytics: async (userId: string): Promise<{
        studyTime: Array<{
            date: string;
            minutes: number;
        }>;
        courseProgress: Array<{
            courseId: string;
            courseTitle: string;
            progress: number;
        }>;
        quizPerformance: Array<{
            quizId: string;
            quizTitle: string;
            score: number;
            passed: boolean;
        }>;
        achievements: Array<{
            id: string;
            title: string;
            description: string;
            earnedAt: Date;
        }>;
    }> => {
        const response = await api.get(`/api/users/${userId}/analytics`);
        return response.data;
    },

    // Get user achievements
    getUserAchievements: async (userId: string): Promise<Array<{
        id: string;
        title: string;
        description: string;
        icon: string;
        earnedAt: Date;
        progress?: number;
        total?: number;
    }>> => {
        const response = await api.get(`/api/users/${userId}/achievements`);
        return response.data;
    },

    // Get user progress
    getUserProgress: async (userId: string): Promise<{
        totalCourses: number;
        completedCourses: number;
        totalProgress: number;
        averageScore: number;
        studyStreak: number;
        totalStudyTime: number;
    }> => {
        const response = await api.get(`/api/users/${userId}/progress`);
        return response.data;
    },

    // Get user recommendations
    getUserRecommendations: async (userId: string): Promise<{
        courses: any[];
        quizzes: any[];
        teachers: any[];
    }> => {
        const response = await api.get(`/api/users/${userId}/recommendations`);
        return response.data;
    },

    // Update user preferences
    updatePreferences: async (userId: string, preferences: {
        language?: string;
        timezone?: string;
        notifications?: {
            email?: boolean;
            push?: boolean;
            sms?: boolean;
        };
        theme?: 'light' | 'dark' | 'system';
    }): Promise<APIResponse> => {
        const response = await api.patch(`/api/users/${userId}/preferences`, preferences);
        return response;
    },

    // Get user settings
    getUserSettings: async (userId: string): Promise<{
        privacy: {
            profileVisibility: 'public' | 'private' | 'friends';
            showProgress: boolean;
            showAchievements: boolean;
        };
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            types: Record<string, boolean>;
        };
        security: {
            twoFactorEnabled: boolean;
            lastPasswordChange: Date;
        };
    }> => {
        const response = await api.get(`/api/users/${userId}/settings`);
        return response.data;
    },

    // Update user settings
    updateUserSettings: async (userId: string, settings: any): Promise<APIResponse> => {
        const response = await api.patch(`/api/users/${userId}/settings`, settings);
        return response;
    },

    // Change password
    changePassword: async (userId: string, passwordData: {
        currentPassword: string;
        newPassword: string;
    }): Promise<APIResponse> => {
        const response = await api.post(`/api/users/${userId}/change-password`, passwordData);
        return response;
    },

    // Enable two-factor authentication
    enableTwoFactor: async (userId: string): Promise<{
        secret: string;
        qrCode: string;
    }> => {
        const response = await api.post(`/api/users/${userId}/2fa/enable`, {});
        return response.data;
    },

    // Disable two-factor authentication
    disableTwoFactor: async (userId: string, code: string): Promise<APIResponse> => {
        const response = await api.post(`/api/users/${userId}/2fa/disable`, { code });
        return response;
    },

    // Verify two-factor authentication
    verifyTwoFactor: async (userId: string, code: string): Promise<APIResponse> => {
        const response = await api.post(`/api/users/${userId}/2fa/verify`, { code });
        return response;
    },

    // Get user activity
    getUserActivity: async (userId: string, page: number = 1, limit: number = 20): Promise<{
        activities: Array<{
            id: string;
            type: string;
            description: string;
            timestamp: Date;
            data?: any;
        }>;
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }> => {
        const response = await api.get(`/api/users/${userId}/activity?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Export user data
    exportUserData: async (userId: string, format: 'csv' | 'json' = 'json'): Promise<Blob> => {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.blob();
    },

    // Delete user account
    deleteAccount: async (userId: string, password: string): Promise<APIResponse> => {
        const response = await api.post(`/api/users/${userId}/delete-account`, { password });
        return response;
    },

    // Get user friends/following
    getUserFriends: async (userId: string): Promise<User[]> => {
        const response = await api.get(`/api/users/${userId}/friends`);
        return response.data;
    },

    // Add friend
    addFriend: async (userId: string, friendId: string): Promise<APIResponse> => {
        const response = await api.post(`/api/users/${userId}/friends`, { friendId });
        return response;
    },

    // Remove friend
    removeFriend: async (userId: string, friendId: string): Promise<APIResponse> => {
        const response = await api.delete(`/api/users/${userId}/friends/${friendId}`);
        return response;
    },

    // Search users
    searchUsers: async (query: string, filters?: {
        role?: string;
        location?: string;
    }): Promise<User[]> => {
        const params = new URLSearchParams({ q: query });

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }

        const response = await api.get(`/api/users/search?${params.toString()}`);
        return response.data;
    }
}; 