import { api, API_BASE_URL } from './api';

export interface ChatMessage {
    _id: string;
    sender: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    content: string;
    messageType: 'text' | 'image' | 'file' | 'video' | 'audio';
    attachments?: Array<{
        filename: string;
        url: string;
        size: number;
        mimeType: string;
    }>;
    isEdited: boolean;
    editedAt?: Date;
    reactions: Array<{
        user: {
            _id: string;
            firstName: string;
            lastName: string;
        };
        emoji: string;
        createdAt: Date;
    }>;
    replyTo?: ChatMessage;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatParticipant {
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    joinedAt: Date;
    lastSeen: Date;
    role: 'member' | 'admin';
}

export interface ChatConversation {
    _id: string;
    participants: ChatParticipant[];
    conversationType: 'direct' | 'group' | 'course' | 'session';
    name?: string;
    description?: string;
    avatar?: string;
    course?: {
        _id: string;
        title: string;
        description?: string;
    };
    session?: {
        _id: string;
        title: string;
        description?: string;
    };
    messages: ChatMessage[];
    lastMessage?: {
        content: string;
        sender: {
            _id: string;
            firstName: string;
            lastName: string;
        };
        timestamp: Date;
    };
    isActive: boolean;
    settings: {
        allowFileSharing: boolean;
        maxFileSize: number;
        muteNotifications: Array<{
            user: {
                _id: string;
                firstName: string;
                lastName: string;
            };
            mutedUntil?: Date;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatFilters {
    conversationType?: 'direct' | 'group' | 'course' | 'session';
    isActive?: boolean;
    search?: string;
}

export interface SendMessageData {
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'video' | 'audio';
    attachments?: Array<{
        filename: string;
        url: string;
        size: number;
        mimeType: string;
    }>;
    replyTo?: string;
}

export interface CreateConversationData {
    participants: string[];
    conversationType: 'direct' | 'group' | 'course' | 'session';
    name?: string;
    description?: string;
    course?: string;
    session?: string;
}

export const chatService = {
    // Get user conversations
    async getConversations(filters: ChatFilters = {}, page = 1, limit = 20) {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (filters.conversationType) params.append('conversationType', filters.conversationType);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.search) params.append('search', filters.search);

        return api.get(`/api/chat/conversations?${params}`);
    },

    // Get conversation by ID
    async getConversation(conversationId: string) {
        return api.get(`/api/chat/conversations/${conversationId}`);
    },

    // Create new conversation
    async createConversation(data: CreateConversationData) {
        return api.post('/api/chat/conversations', data);
    },

    // Send message
    async sendMessage(conversationId: string, data: SendMessageData) {
        return api.post(`/api/chat/conversations/${conversationId}/messages`, data);
    },

    // Update message
    async updateMessage(conversationId: string, messageId: string, content: string) {
        return api.patch(`/api/chat/conversations/${conversationId}/messages/${messageId}`, { content });
    },

    // Delete message
    async deleteMessage(conversationId: string, messageId: string) {
        return api.delete(`/api/chat/conversations/${conversationId}/messages/${messageId}`);
    },

    // Add reaction to message
    async addReaction(conversationId: string, messageId: string, emoji: string) {
        return api.post(`/api/chat/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji });
    },

    // Remove reaction from message
    async removeReaction(conversationId: string, messageId: string, emoji: string) {
        return api.delete(`/api/chat/conversations/${conversationId}/messages/${messageId}/reactions/${emoji}`);
    },

    // Mark conversation as read
    async markAsRead(conversationId: string) {
        return api.post(`/api/chat/conversations/${conversationId}/read`, {});
    },

    // Get unread count
    async getUnreadCount() {
        return api.get('/api/chat/unread-count');
    },

    // Search conversations
    async searchConversations(query: string) {
        return api.get(`/api/chat/conversations/search?q=${encodeURIComponent(query)}`);
    },

    // Get conversation participants
    async getParticipants(conversationId: string) {
        return api.get(`/api/chat/conversations/${conversationId}/participants`);
    },

    // Add participant to conversation
    async addParticipant(conversationId: string, userId: string) {
        return api.post(`/api/chat/conversations/${conversationId}/participants`, { userId });
    },

    // Remove participant from conversation
    async removeParticipant(conversationId: string, userId: string) {
        return api.delete(`/api/chat/conversations/${conversationId}/participants/${userId}`);
    },

    // Update conversation settings
    async updateSettings(conversationId: string, settings: Partial<ChatConversation['settings']>) {
        return api.patch(`/api/chat/conversations/${conversationId}/settings`, settings);
    },

    // Archive conversation
    async archiveConversation(conversationId: string) {
        return api.post(`/api/chat/conversations/${conversationId}/archive`, {});
    },

    // Unarchive conversation
    async unarchiveConversation(conversationId: string) {
        return api.post(`/api/chat/conversations/${conversationId}/unarchive`, {});
    }
}; 