import {
    Session,
    CreateSessionRequest,
    EnrollSessionRequest,
    UpdateAttendanceRequest,
    AvailableTimeSlot,
    TeacherAvailability,
    APIResponse,
    PaginatedResponse
} from './types';
import { api } from './api';

// Session API Service
export class SessionService {
    // Get all sessions with filtering
    static async getSessions(params: {
        page?: number;
        limit?: number;
        course?: string;
        teacher?: string;
        status?: string;
    } = {}): Promise<PaginatedResponse<Session>> {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, value.toString());
        });

        return api.get(`/api/sessions?${searchParams}`);
    }

    // Get session by ID
    static async getSession(sessionId: string): Promise<Session> {
        const result: APIResponse<Session> = await api.get(`/api/sessions/${sessionId}`);
        return result.data;
    }

    // Create new session
    static async createSession(sessionData: CreateSessionRequest): Promise<Session> {
        const result: APIResponse<Session> = await api.post('/api/sessions', sessionData);
        return result.data;
    }

    // Update session
    static async updateSession(sessionId: string, sessionData: Partial<CreateSessionRequest>): Promise<Session> {
        const result: APIResponse<Session> = await api.put(`/api/sessions/${sessionId}`, sessionData);
        return result.data;
    }

    // Delete session
    static async deleteSession(sessionId: string): Promise<void> {
        await api.patch(`/api/sessions/${sessionId}`, { status: 'deleted' });
    }

    // Enroll in session
    static async enrollInSession(sessionId: string): Promise<void> {
        await api.post(`/api/sessions/${sessionId}/enroll`);
    }

    // Update attendance
    static async updateAttendance(sessionId: string, attendanceData: UpdateAttendanceRequest): Promise<void> {
        await api.put(`/api/sessions/${sessionId}/attendance`, attendanceData);
    }

    // Get available time slots
    static async getAvailableTimeSlots(teacherId: string, date: Date, duration: number = 60): Promise<AvailableTimeSlot[]> {
        const dateStr = date.toISOString().split('T')[0];
        const result: APIResponse<AvailableTimeSlot[]> = await api.get(`/api/sessions/available-slots/${teacherId}?date=${dateStr}&duration=${duration}`);
        return result.data;
    }
}

// Teacher Availability API Service
export class TeacherAvailabilityService {
    // Get teacher availability
    static async getTeacherAvailability(teacherId: string, date?: Date): Promise<{
        teacher: { id: string; name: string; avatar?: string };
        availability: TeacherAvailability[];
        availableSlots?: AvailableTimeSlot[];
    }> {
        const searchParams = new URLSearchParams();
        if (date) {
            searchParams.append('date', date.toISOString().split('T')[0]);
        }

        const result: APIResponse<{
            teacher: { id: string; name: string; avatar?: string };
            availability: TeacherAvailability[];
            availableSlots?: AvailableTimeSlot[];
        }> = await api.get(`/api/teachers/${teacherId}/availability?${searchParams}`);
        return result.data;
    }

    // Update teacher availability
    static async updateTeacherAvailability(teacherId: string, availability: TeacherAvailability[]): Promise<{
        availability: TeacherAvailability[];
    }> {
        const result: APIResponse<{ availability: TeacherAvailability[] }> = await api.put(`/api/teachers/${teacherId}/availability`, { availability });
        return result.data;
    }

    // Get teacher's sessions
    static async getTeacherSessions(teacherId: string, params: {
        status?: string;
        limit?: number;
        page?: number;
    } = {}): Promise<PaginatedResponse<Session>> {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, value.toString());
        });

        return api.get(`/api/teachers/${teacherId}/sessions?${searchParams}`);
    }
}

// Export default instances
export default {
    sessions: SessionService,
    availability: TeacherAvailabilityService
};
