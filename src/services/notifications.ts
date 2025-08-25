import { api, APIResponse, API_BASE_URL } from './api';
import { Notification } from './types';

export interface NotificationFilters {
    type?: string;
    isRead?: boolean;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface NotificationData {
    recipient: string;
    sender?: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
    actionUrl?: string;
    expiresAt?: Date;
}

export const notificationService = {
    // Get user notifications
    getUserNotifications: async (userId: string, filters?: NotificationFilters): Promise<Notification[]> => {
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

        const response = await api.get(`/users/${userId}/notifications?${params.toString()}`);
        return response.data;
    },

    // Get notification by ID
    getNotificationById: async (notificationId: string): Promise<Notification> => {
        const response = await api.get(`/notifications/${notificationId}`);
        return response.data;
    },

    // Get unread notifications
    getUnreadNotifications: async (userId: string): Promise<Notification[]> => {
        const response = await api.get(`/users/${userId}/notifications/unread`);
        return response.data;
    },

    // Get notification count
    getNotificationCount: async (userId: string): Promise<{
        total: number;
        unread: number;
        byType: Record<string, number>;
    }> => {
        const response = await api.get(`/users/${userId}/notifications/count`);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<APIResponse> => {
        const response = await api.patch(`/notifications/${notificationId}/read`, {});
        return response;
    },

    // Mark multiple notifications as read
    markMultipleAsRead: async (notificationIds: string[]): Promise<APIResponse> => {
        const response = await api.patch('/notifications/mark-read', {
            notificationIds
        });
        return response;
    },

    // Mark all notifications as read
    markAllAsRead: async (userId: string): Promise<APIResponse> => {
        const response = await api.patch(`/users/${userId}/notifications/mark-all-read`, {});
        return response;
    },

    // Create notification
    createNotification: async (notificationData: NotificationData): Promise<APIResponse> => {
        const response = await api.post('/notifications', notificationData);
        return response;
    },

    // Create multiple notifications
    createMultipleNotifications: async (notifications: NotificationData[]): Promise<APIResponse> => {
        const response = await api.post('/notifications/bulk', { notifications });
        return response;
    },

    // Update notification
    updateNotification: async (notificationId: string, updateData: Partial<Notification>): Promise<APIResponse> => {
        const response = await api.patch(`/notifications/${notificationId}`, updateData);
        return response;
    },

    // Delete notification
    deleteNotification: async (notificationId: string): Promise<APIResponse> => {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response;
    },

    // Delete multiple notifications
    deleteMultipleNotifications: async (notificationIds: string[]): Promise<APIResponse> => {
        const response = await api.post('/notifications/bulk-delete', { notificationIds });
        return response;
    },

    // Delete all notifications
    deleteAllNotifications: async (userId: string): Promise<APIResponse> => {
        const response = await api.delete(`/users/${userId}/notifications`);
        return response;
    },

    // Get notification preferences
    getNotificationPreferences: async (userId: string): Promise<{
        email: boolean;
        push: boolean;
        sms: boolean;
        types: Record<string, boolean>;
    }> => {
        const response = await api.get(`/users/${userId}/notification-preferences`);
        return response.data;
    },

    // Update notification preferences
    updateNotificationPreferences: async (userId: string, preferences: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
        types?: Record<string, boolean>;
    }): Promise<APIResponse> => {
        const response = await api.patch(`/users/${userId}/notification-preferences`, preferences);
        return response;
    },

    // Get notification history
    getNotificationHistory: async (userId: string, page: number = 1, limit: number = 20): Promise<{
        notifications: Notification[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }> => {
        const response = await api.get(`/users/${userId}/notifications/history?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get notification statistics
    getNotificationStats: async (userId: string): Promise<{
        totalNotifications: number;
        unreadCount: number;
        readCount: number;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
        recentActivity: Array<{
            date: string;
            count: number;
        }>;
    }> => {
        const response = await api.get(`/users/${userId}/notifications/stats`);
        return response.data;
    },

    // Subscribe to push notifications
    subscribeToPushNotifications: async (userId: string, subscription: any): Promise<APIResponse> => {
        const response = await api.post(`/users/${userId}/push-subscription`, subscription);
        return response;
    },

    // Unsubscribe from push notifications
    unsubscribeFromPushNotifications: async (userId: string): Promise<APIResponse> => {
        const response = await api.delete(`/users/${userId}/push-subscription`);
        return response;
    },

    // Get notification templates
    getNotificationTemplates: async (): Promise<Array<{
        id: string;
        name: string;
        type: string;
        title: string;
        message: string;
        variables: string[];
    }>> => {
        const response = await api.get('/notifications/templates');
        return response.data;
    },

    // Get notification settings
    getNotificationSettings: async (): Promise<{
        emailSettings: {
            enabled: boolean;
            frequency: 'immediate' | 'daily' | 'weekly';
            types: string[];
        };
        pushSettings: {
            enabled: boolean;
            types: string[];
        };
        smsSettings: {
            enabled: boolean;
            types: string[];
        };
    }> => {
        const response = await api.get('/notifications/settings');
        return response.data;
    },

    // Update notification settings
    updateNotificationSettings: async (settings: any): Promise<APIResponse> => {
        const response = await api.patch('/notifications/settings', settings);
        return response;
    },

    // Export notifications
    exportNotifications: async (userId: string, format: 'csv' | 'json' = 'json'): Promise<Blob> => {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/notifications/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.blob();
    }
}; 