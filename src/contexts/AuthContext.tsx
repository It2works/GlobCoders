import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  isActive: boolean;
  isBlocked: boolean;
  isLocked?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Teacher-specific fields
  presentationVideo?: string;
  teacherApprovalStatus?: 'pending' | 'approved' | 'rejected';
  teacherApprovalDate?: Date;
  teacherRejectionReason?: string;
  teacherApprovalNotes?: string;
  // Admin verification fields
  isAdminVerified?: boolean;
  adminVerificationDate?: Date;
  adminCertificateHash?: string;
  // Admin certificate fields (legacy)
  adminCertificate?: {
    certificateFile?: string;
    certificateHash?: string;
    verified?: boolean;
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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Safely get navigate function
  let navigate: any;
  try {
    navigate = useNavigate();
  } catch (error) {
    // If useNavigate is not available, create a fallback
    navigate = (path: string) => {
      console.log('Navigation not available, would navigate to:', path);
      // Fallback to window.location if needed
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    };
  }

  const API_BASE_URL = 'http://localhost:5000/api';

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.data.user);
            setToken(storedToken);
            // Reset admin verification if token is invalid
            if (data.data.user?.role === 'admin') {
              setUser(prev => prev ? { ...prev, isAdminVerified: false } : null);
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Don't remove token on network errors, just set loading to false
          // This allows the app to work even when backend is not available
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token: authToken, user: userData } = data.data;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);

      // Redirect based on user role and certificate verification status
      switch (userData.role) {
        case 'admin':
          // Admin must verify certificate each session
          if (userData.isAdminVerified) {
            navigate('/admin-dashboard');
          } else {
            navigate('/admin-certificate-verification');
          }
          break;
        case 'teacher':
          // Check if teacher is approved
          if (userData.teacherApprovalStatus === 'approved') {
            navigate('/teacher-dashboard');
          } else {
            navigate('/teacher-pending-approval');
          }
          break;
        case 'student':
          navigate('/student-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const { token: authToken, user: newUser } = data.data;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(newUser);

      // Redirect based on user role and certificate verification status
      switch (newUser.role) {
        case 'admin':
          // Admin must verify certificate each session
          if (newUser.isAdminVerified) {
            navigate('/admin-dashboard');
          } else {
            navigate('/admin-certificate');
          }
          break;
        case 'teacher':
          // Check if teacher is approved
          if (newUser.teacherApprovalStatus === 'approved') {
            navigate('/teacher-dashboard');
          } else {
            navigate('/teacher-pending-approval');
          }
          break;
        case 'student':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Simple logout - don't reset admin verification status
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/');
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};