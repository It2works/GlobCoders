// Update API base URL for local development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// Helper function to create headers
const createHeaders = (customHeaders?: Record<string, string>): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...customHeaders
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorData: any = {};

        try {
            const errorText = await response.text();
            console.error('=== BACKEND ERROR RESPONSE ===');
            console.error('Status:', response.status);
            console.error('Status Text:', response.statusText);
            console.error('URL:', response.url);
            console.error('Raw Error Response:', errorText);

            try {
                errorData = JSON.parse(errorText);
                console.error('Parsed Error Data:', errorData);
            } catch (parseError) {
                console.error('Failed to parse error response:', parseError);
                errorData = { message: `HTTP error! status: ${response.status}` };
            }
        } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            errorData = { message: `HTTP error! status: ${response.status}` };
        }

        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: errorData
        });

        throw new Error(errorMessage);
    }

    try {
        const data = await response.json();
        return data;
    } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response format from server');
    }
};

// Helper function to handle network errors
const handleNetworkError = (error: any) => {
    console.error('Network error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
};

// Check if we're offline - TEMPORARILY DISABLED for debugging
const isOffline = () => {
    // Temporarily disabled to fix connection issues
    return false;

    // Original logic (commented out for now)
    // if (!navigator.onLine) {
    //     return true;
    // }
    // return false;
};

// Add retry logic with exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            // Don't retry if it's not a network error
            if (error.message && !error.message.includes('Unable to connect to server')) {
                throw error;
            }

            const delay = baseDelay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// API methods with improved error handling
export const api = {
    // GET request
    get: async (endpoint: string, customHeaders?: Record<string, string>) => {
        // Check if offline first
        if (isOffline()) {
            throw new Error('You are currently offline. Please check your internet connection.');
        }

        return retryWithBackoff(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'GET',
                    headers: createHeaders(customHeaders),
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(10000)
                });
                return handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
            }
        });
    },

    // POST request
    post: async (endpoint: string, data: any, customHeaders?: Record<string, string>) => {
        // Check if offline first
        if (isOffline()) {
            throw new Error('You are currently offline. Please check your internet connection.');
        }

        return retryWithBackoff(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: createHeaders(customHeaders),
                    body: JSON.stringify(data),
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(10000)
                });
                return handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
            }
        });
    },

    // PUT request
    put: async (endpoint: string, data: any, customHeaders?: Record<string, string>) => {
        // Check if offline first
        if (isOffline()) {
            throw new Error('You are currently offline. Please check your internet connection.');
        }

        return retryWithBackoff(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'PUT',
                    headers: createHeaders(customHeaders),
                    body: JSON.stringify(data),
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(10000)
                });
                return handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
            }
        });
    },

    // PATCH request
    patch: async (endpoint: string, data: any, customHeaders?: Record<string, string>) => {
        // Check if offline first
        if (isOffline()) {
            throw new Error('You are currently offline. Please check your internet connection.');
        }

        return retryWithBackoff(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'PATCH',
                    headers: createHeaders(customHeaders),
                    body: JSON.stringify(data),
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(10000)
                });
                return handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
            }
        });
    },

    // DELETE request
    delete: async (endpoint: string, customHeaders?: Record<string, string>) => {
        // Check if offline first
        if (isOffline()) {
            throw new Error('You are currently offline. Please check your internet connection.');
        }

        return retryWithBackoff(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'DELETE',
                    headers: createHeaders(customHeaders),
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(10000)
                });
                return handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
            }
        });
    }
};

// Admin API functions
export const adminAPI = {
    // Dashboard statistics
    getDashboardStats: async () => {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.json();
    },

    // User management
    getUsers: async (params: {
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        search?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/users?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.json();
    },

    updateUser: async (userId: string, userData: any) => {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    approveTeacher: async (userId: string, approvalNotes?: string) => {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ approvalNotes })
        });
        return response.json();
    },

    rejectTeacher: async (userId: string, rejectionReason: string) => {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ rejectionReason })
        });
        return response.json();
    },

    toggleUserBlock: async (userId: string, blockedReason?: string) => {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ blockedReason })
        });
        return response.json();
    },

    // Payment management
    getPaymentStats: async (period: string = '30') => {
        const response = await fetch(`${API_BASE_URL}/api/admin/payments/stats?period=${period}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.json();
    },

    getPayments: async (params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/payments?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.json();
    }
};

// Teacher API functions
export const teacherAPI = {
    // Dashboard statistics
    getDashboardStats: async () => {
        const response = await fetch(`${API_BASE_URL}/api/teachers/dashboard`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Get teacher's courses
    getCourses: async (params: { page?: number; limit?: number; status?: string; search?: string; } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);

        const response = await fetch(`${API_BASE_URL}/api/teachers/courses?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Get teacher's students
    getStudents: async (params: { page?: number; limit?: number; courseId?: string; } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.courseId) queryParams.append('courseId', params.courseId);

        const response = await fetch(`${API_BASE_URL}/api/teachers/students?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Get teacher's earnings
    getEarnings: async (period: string = '30') => {
        const response = await fetch(`${API_BASE_URL}/api/teachers/earnings?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Get teacher's quizzes
    getQuizzes: async (params: { page?: number; limit?: number; courseId?: string; } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.courseId) queryParams.append('courseId', params.courseId);

        const response = await fetch(`${API_BASE_URL}/api/teachers/quizzes?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Get teacher's sessions
    getSessions: async (params: { page?: number; limit?: number; status?: string; } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);

        const response = await fetch(`${API_BASE_URL}/api/teachers/sessions?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Update teacher profile
    updateProfile: async (profileData: any) => {
        const response = await fetch(`${API_BASE_URL}/api/teachers/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        return response.json();
    }
};

// API error types
export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// Response wrapper type
export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
    error?: string;
} 