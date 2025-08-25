import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  courseService,
  enrollmentService,
  quizService,
  notificationService,
  userService,
  chatService,
  type Course,
  type Enrollment,
  type Quiz,
  type Notification,
  type DashboardStats,
  type ChatConversation,
  type ChatMessage,
  type User
} from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { adminAPI, api } from '@/services/api';
import { CustomNotification } from '@/services/types';

// Loading states interface
interface LoadingStates {
  courses: boolean;
  quizzes: boolean;
  enrollments: boolean;
  notifications: boolean;
  userStats: boolean;
  dashboardStats: boolean;
  conversations: boolean;
  messages: boolean;
  payments: boolean;
}

// Error states interface
interface ErrorStates {
  courses: string | null;
  quizzes: string | null;
  enrollments: string | null;
  notifications: string | null;
  userStats: string | null;
  dashboardStats: string | null;
  conversations: string | null;
  messages: string | null;
  payments: string | null;
}

interface AppData {
  // Data
  users: User[];
  courses: Course[];
  quizzes: Quiz[];
  enrollments: Enrollment[];
  notifications: CustomNotification[]; // Use CustomNotification instead of Notification
  payments: any[]; // Add payments array
  dashboardStats: DashboardStats | null;
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  messages: ChatMessage[];
  currentUser: User | null; // Add currentUser property

  // Loading states
  loading: LoadingStates;

  // Error states
  errors: ErrorStates;

  // Actions
  refreshCourses: () => Promise<void>;
  refreshQuizzes: () => Promise<void>;
  refreshEnrollments: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshDashboardStats: () => Promise<void>;
  refreshPayments: () => Promise<void>;

  // Course actions
  enrollInCourse: (courseId: string) => Promise<void>;
  getCourseProgress: (courseId: string) => Promise<number>;
  updateCourseProgress: (courseId: string, progress: number) => Promise<void>;

  // Quiz actions
  getAvailableQuizzes: () => Promise<Quiz[]>;
  startQuizAttempt: (quizId: string) => Promise<any>;
  submitQuizAttempt: (quizId: string, answers: any[]) => Promise<void>;

  // Notification actions
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // User actions
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  getUserAnalytics: () => Promise<any>;
  updateUser: (userId: number, userData: Partial<User>) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;

  // Course management actions
  updateCourse: (courseId: number, courseData: Partial<Course>) => Promise<void>;
  addCourse: (courseData: any) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  // Quiz management actions
  addQuiz: (quizData: any) => Promise<void>;

  // Data fetching actions
  fetchCourses: () => Promise<void>;
  fetchQuizzes: () => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchNotifications: () => Promise<void>;

  // Chat actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (participants: string[], conversationType?: 'direct' | 'group' | 'course' | 'session') => Promise<any>;

  // Utility
  isEnrolledInCourse: (courseId: string) => boolean;
  getEnrollmentByCourse: (courseId: string) => Enrollment | undefined;
}

const AppDataContext = createContext<AppData | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<LoadingStates>({
    courses: false,
    enrollments: false,
    quizzes: false,
    notifications: false,
    userStats: false,
    dashboardStats: false,
    conversations: false,
    messages: false,
    payments: false
  });
  const [errors, setErrors] = useState<ErrorStates>({
    courses: null,
    enrollments: null,
    quizzes: null,
    notifications: null,
    userStats: null,
    dashboardStats: null,
    conversations: null,
    messages: null,
    payments: null
  });

  // Helper functions to set loading and error states
  const setLoadingState = (key: keyof LoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: keyof ErrorStates, error: string | null) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  // Fetch courses
  const fetchCourses = async () => {
    // Allow fetching courses even for non-authenticated users (for public courses page)
    setLoadingState('courses', true);
    setErrorState('courses', null);

    try {
      let coursesData;

      // If user is a teacher, fetch all courses (including drafts)
      if (isAuthenticated && user && (user.role === 'teacher' || user.role === 'admin')) {
        // For teachers, we need to fetch all courses, not just available ones
        const response = await api.get('/api/courses?status=all');
        coursesData = response.data;
      } else {
        // For students and public, fetch only available courses
        coursesData = await courseService.getAvailableCourses();
      }

      setCourses(coursesData);
      // Cache courses for offline use
      localStorage.setItem('offline_courses', JSON.stringify(coursesData));
      localStorage.setItem('last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Error fetching courses:', error);

      // Handle rate limiting specifically
      if (error.message && error.message.includes('429')) {
        console.warn('Rate limited when fetching courses, will retry after 5 seconds');
        setErrorState('courses', 'Server busy, retrying in 5 seconds...');
        // Retry after 5 seconds
        setTimeout(() => fetchCourses(), 5000);
        return;
      }

      // Try to load cached courses if offline
      const cachedCourses = localStorage.getItem('offline_courses');
      if (cachedCourses) {
        try {
          const parsedCourses = JSON.parse(cachedCourses);
          setCourses(parsedCourses);
          setErrorState('courses', 'Using cached data - you are offline');
        } catch (parseError) {
          setErrorState('courses', 'Failed to load courses and cached data is corrupted');
        }
      } else {
        setErrorState('courses', 'Failed to load courses');
      }

      // Don't retry immediately if server is down
      if (error.message && error.message.includes('Unable to connect to server')) {
        return;
      }
    } finally {
      setLoadingState('courses', false);
    }
  };

  // Fetch quizzes
  const fetchQuizzes = async () => {
    if (!isAuthenticated || !user) return;

    setLoadingState('quizzes', true);
    setErrorState('quizzes', null);

    try {
      const availableQuizzes = await quizService.getAvailableQuizzes(user._id);
      setQuizzes(availableQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);

      // Handle rate limiting specifically
      if (error.message && error.message.includes('429')) {
        console.warn('Rate limited when fetching quizzes, will retry after 5 seconds');
        setErrorState('quizzes', 'Server busy, retrying in 5 seconds...');
        // Retry after 5 seconds
        setTimeout(() => fetchQuizzes(), 5000);
        return;
      }

      setErrorState('quizzes', 'Failed to load quizzes');
      // Don't retry immediately if server is down
      if (error.message && error.message.includes('Unable to connect to server')) {
        return;
      }
    } finally {
      setLoadingState('quizzes', false);
    }
  };

  // Fetch enrollments
  const fetchEnrollments = async () => {
    if (!isAuthenticated || !user) return;

    setLoadingState('enrollments', true);
    setErrorState('enrollments', null);

    try {
      const userEnrollments = await enrollmentService.getUserEnrollments(user._id);
      setEnrollments(userEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setErrorState('enrollments', 'Failed to load enrollments');
      // Don't retry immediately if server is down
      if (error.message && error.message.includes('Unable to connect to server')) {
        return;
      }
    } finally {
      setLoadingState('enrollments', false);
    }
  };

  // Fetch notifications - STABLE VERSION
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoadingState('notifications', true);
    setErrorState('notifications', null);

    try {
      const userNotifications = await userService.getUserNotifications(user._id);

      // Transform Notification data to CustomNotification format
      const customNotifications: CustomNotification[] = userNotifications.map(notification => ({
        _id: notification._id,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        user_id: notification.recipient, // Map recipient to user_id
        titre: notification.title, // Map title to titre
        message: notification.message,
        statut: notification.isRead ? 'lue' : 'non_lue', // Map isRead to statut
        type: notification.type === 'payment_failed' || notification.type === 'assignment_due' ? 'alerte' : 'info', // Map type
        redirect_url: notification.actionUrl, // Map actionUrl to redirect_url
      }));

      setNotifications(customNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setErrorState('notifications', 'Failed to load notifications');
      // Don't retry immediately if server is down
      if (error.message && error.message.includes('Unable to connect to server')) {
        return;
      }
    } finally {
      setLoadingState('notifications', false);
    }
  }, [isAuthenticated, user]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!isAuthenticated || !user) return;

    setLoadingState('dashboardStats', true);
    setErrorState('dashboardStats', null);

    try {
      const stats = await userService.getDashboardStats(user._id);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setErrorState('dashboardStats', 'Failed to load dashboard statistics');
    } finally {
      setLoadingState('dashboardStats', false);
    }
  };

  // Fetch users (for admin)
  const fetchUsers = async () => {
    if (!isAuthenticated || !user) return;

    setLoadingState('userStats', true);
    setErrorState('userStats', null);

    try {
      const response = await adminAPI.getUsers();
      if (response.success) {
        setUsers(response.data.users);
      } else {
        setErrorState('userStats', response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorState('userStats', 'Failed to load users');
    } finally {
      setLoadingState('userStats', false);
    }
  };

  // Fetch payments (for admin)
  const fetchPayments = async () => {
    if (!isAuthenticated || !user) return;

    setLoadingState('payments', true);
    setErrorState('payments', null);

    try {
      const response = await adminAPI.getPayments();
      if (response.success) {
        setPayments(response.data.payments);
      } else {
        setErrorState('payments', response.message || 'Failed to load payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setErrorState('payments', 'Failed to load payments');
    } finally {
      setLoadingState('payments', false);
    }
  };

  // User management functions
  const updateUser = async (userId: number, userData: Partial<User>) => {
    try {
      const response = await adminAPI.updateUser(userId.toString(), userData);
      if (response.success) {
        // Refresh users after update
        await fetchUsers();
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const response = await adminAPI.approveTeacher(userId);

      if (response.success) {
        // Refresh users after approval
        await fetchUsers();
        toast({
          title: "Success",
          description: "User approved successfully",
        });
      } else {
        console.error('Admin API returned error:', response);
        toast({
          title: "Error",
          description: response.message || "Failed to approve user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in approveUser:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const response = await adminAPI.rejectTeacher(userId, 'Application rejected by admin');
      if (response.success) {
        // Refresh users after rejection
        await fetchUsers();
        toast({
          title: "Success",
          description: "User rejected successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
  };

  // Course management function
  const updateCourse = async (courseId: number, courseData: Partial<Course>) => {
    try {
      setCourses(prev => Array.isArray(prev) ? prev.map(course =>
        course._id === courseId.toString() ? { ...course, ...courseData } : course
      ) : []);
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    }
  };

  // Refresh functions
  const refreshCourses = async () => {
    await fetchCourses();
  };

  const refreshQuizzes = async () => {
    await fetchQuizzes();
  };

  const refreshEnrollments = async () => {
    await fetchEnrollments();
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const refreshDashboardStats = async () => {
    await fetchDashboardStats();
  };

  const refreshPayments = async () => {
    await fetchPayments();
  };

  // Course actions
  const enrollInCourse = async (courseId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      await courseService.enrollInCourse(courseId, user._id);
      // Refresh enrollments after enrolling
      await fetchEnrollments();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  };

  const getCourseProgress = async (courseId: string): Promise<number> => {
    if (!isAuthenticated || !user) return 0;

    try {
      return await enrollmentService.getProgress(courseId, user._id);
    } catch (error) {
      console.error('Error getting course progress:', error);
      return 0;
    }
  };

  const updateCourseProgress = async (courseId: string, progress: number) => {
    if (!isAuthenticated || !user) return;

    try {
      await enrollmentService.updateProgress({
        courseId,
        userId: user._id,
        progress
      });
      // Refresh enrollments after updating progress
      await fetchEnrollments();
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  };

  // Quiz actions
  const getAvailableQuizzes = async (): Promise<Quiz[]> => {
    if (!isAuthenticated || !user) return [];

    try {
      return await quizService.getAvailableQuizzes(user._id);
    } catch (error) {
      console.error('Error getting available quizzes:', error);
      return [];
    }
  };

  const startQuizAttempt = async (quizId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      return await quizService.startQuizAttempt(quizId, user._id);
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  };

  const submitQuizAttempt = async (quizId: string, answers: any[]) => {
    if (!isAuthenticated || !user) return;

    try {
      await quizService.submitQuizAttempt({
        quizId,
        studentId: user._id,
        answers
      });
      // Refresh quizzes after submission
      await fetchQuizzes();
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  };

  // Notification actions
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Refresh notifications after marking as read
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!isAuthenticated || !user) return;

    try {
      await notificationService.markAllAsRead(user._id);
      // Refresh notifications after marking all as read
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  // User actions
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!isAuthenticated || !user) return;

    try {
      await userService.updateProfile(user._id, userData);
      // Refresh dashboard stats after updating profile
      await fetchDashboardStats();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const getUserAnalytics = async () => {
    if (!isAuthenticated || !user) return null;

    try {
      return await userService.getUserAnalytics(user._id);
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  };

  // Chat functions
  const fetchConversations = async () => {
    if (!user?._id) return;

    setLoading(prev => ({ ...prev, conversations: true }));
    setErrors(prev => ({ ...prev, conversations: null }));

    try {
      const response = await chatService.getConversations();

      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('useAppData: Error fetching conversations:', error);
      setErrors(prev => ({ ...prev, conversations: error instanceof Error ? error.message : 'Failed to fetch conversations' }));
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user?._id) return;

    setLoading(prev => ({ ...prev, messages: true }));
    setErrors(prev => ({ ...prev, messages: null }));

    try {
      const response = await chatService.getConversation(conversationId);

      if (response.success) {
        setCurrentConversation(response.data);
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('useAppData: Error fetching messages:', error);
      setErrors(prev => ({ ...prev, messages: error instanceof Error ? error.message : 'Failed to fetch messages' }));
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user?._id) return;

    try {
      const response = await chatService.sendMessage(conversationId, { content });

      if (response.success) {
        // Refresh messages
        await fetchMessages(conversationId);
        // Refresh conversations to update last message
        await fetchConversations();
      }
    } catch (error) {
      console.error('useAppData: Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  const createConversation = async (participants: string[], conversationType: 'direct' | 'group' | 'course' | 'session' = 'direct') => {
    if (!user?._id) return;

    try {
      const response = await chatService.createConversation({
        participants,
        conversationType
      });

      if (response.success) {
        // Refresh conversations
        await fetchConversations();
        return response.data;
      }
    } catch (error) {
      console.error('useAppData: Error creating conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
    }
  };

  // Utility functions
  const isEnrolledInCourse = (courseId: string): boolean => {
    return Array.isArray(enrollments) && enrollments.some(enrollment =>
      enrollment.course._id === courseId
    );
  };

  const getEnrollmentByCourse = (courseId: string): Enrollment | undefined => {
    return Array.isArray(enrollments) ? enrollments.find(enrollment =>
      enrollment.course._id === courseId
    ) : undefined;
  };

  // Course management functions
  const addCourse = async (courseData: any) => {
    try {
      const response = await api.post('/api/courses', courseData);
      if (response.success) {
        await fetchCourses();
      }
      return response;
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const response = await api.delete(`/api/courses/${courseId}`);
      if (response.success) {
        await fetchCourses();
      }
      return response;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  // Quiz management functions
  const addQuiz = async (quizData: any) => {
    try {
      console.log('=== QUIZ CREATION DEBUG ===');
      console.log('Quiz data structure:', {
        hasTitle: !!quizData.title,
        hasDescription: !!quizData.description,
        hasCourse: !!quizData.course,
        hasQuestions: !!quizData.questions,
        questionsCount: quizData.questions?.length || 0,
        questionsWithPoints: Array.isArray(quizData.questions) ? quizData.questions.filter((q: any) => q.points).length : 0
      });
      console.log('Full quiz data:', JSON.stringify(quizData, null, 2));

      const response = await api.post('/api/quizzes', quizData);
      if (response.success) {
        console.log('Quiz created successfully, refreshing quiz list...');
        await fetchQuizzes();
        console.log('Quiz list refreshed, current quizzes:', quizzes);
      }
      return response;
    } catch (error) {
      console.error('=== QUIZ CREATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      console.error('Quiz data that failed:', quizData);
      throw error;
    }
  };

  // Initial data loading with staggered requests to prevent rate limiting
  useEffect(() => {
    // Always fetch courses (for public courses page)
    fetchCourses();

    if (isAuthenticated && user) {
      // Stagger API calls to prevent rate limiting
      setTimeout(() => fetchQuizzes(), 200);
      setTimeout(() => fetchEnrollments(), 400);
      setTimeout(() => fetchNotifications(), 600);
      setTimeout(() => fetchDashboardStats(), 800);
      setTimeout(() => fetchConversations(), 1000);

      // Only fetch admin-specific data for admin users
      if (user.role === 'admin') {
        setTimeout(() => fetchUsers(), 1200);
        setTimeout(() => fetchPayments(), 1400);
      }
    } else {
      // User not authenticated or no user data
    }
  }, [isAuthenticated, user]);

  // DISABLED: Auto-refresh notifications - causing infinite loops
  // useEffect(() => {
  //   if (!isAuthenticated || !user) return;
  //   const interval = setInterval(() => {
  //     fetchNotifications();
  //   }, 120000);
  //   return () => clearInterval(interval);
  // }, [isAuthenticated, user, fetchNotifications]);

  return (
    <AppDataContext.Provider value={{
      // Data
      users,
      courses,
      quizzes,
      enrollments,
      notifications,
      payments,
      dashboardStats,
      conversations,
      currentConversation,
      messages,
      currentUser: user as User, // Cast to correct User type

      // Loading states
      loading,

      // Error states
      errors,

      // Actions
      refreshCourses,
      refreshQuizzes,
      refreshEnrollments,
      refreshNotifications,
      refreshDashboardStats,
      refreshPayments, // Add this line to refresh payments

      // Course actions
      enrollInCourse,
      getCourseProgress,
      updateCourseProgress,

      // Quiz actions
      getAvailableQuizzes,
      startQuizAttempt,
      submitQuizAttempt,

      // Notification actions
      markNotificationAsRead,
      markAllNotificationsAsRead,

      // User actions
      updateUserProfile,
      getUserAnalytics,
      updateUser,
      approveUser,
      rejectUser,

      // Course management actions
      updateCourse,
      addCourse,
      deleteCourse,

      // Quiz management actions
      addQuiz,

      // Data fetching actions
      fetchCourses,
      fetchQuizzes,
      fetchEnrollments,
      fetchPayments,
      fetchNotifications,

      // Chat actions
      fetchConversations,
      fetchMessages,
      sendMessage,
      createConversation,

      // Utility
      isEnrolledInCourse,
      getEnrollmentByCourse
    }}>
      {children}
    </AppDataContext.Provider>
  );
};