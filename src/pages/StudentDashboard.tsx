import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import Header from "@/components/Header";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";

import { ProgressTracking } from "@/components/ProgressTracking";
import { MessagingCenter } from "@/components/MessagingCenter";
import {
  LoadingSpinner,
  ErrorState,
  CourseCardSkeleton,
  QuizCardSkeleton,
  EmptyState
} from "@/components/ui/loading-states";
import {
  BookOpen,
  Trophy,
  Clock,
  Users,
  Play,
  Calendar,
  Award,
  BookMarked,
  MessageSquare,
  TrendingUp,
  Target,
  Search,
  Filter
} from "lucide-react";

const StudentDashboard = () => {
  const {
    courses,
    enrollments,
    quizzes,
    dashboardStats,
    loading,
    errors,
    enrollInCourse,
    updateCourseProgress,
    refreshCourses,
    refreshEnrollments,
    refreshDashboardStats
  } = useAppData();

  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionBookingModal, setSessionBookingModal] = useState({ isOpen: false, courseId: '' });
  const [activeTab, setActiveTab] = useState("overview");

  // Get courses from student's enrolled sessions (purchased sessions)
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Quiz-related state
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);

  // Add state to track quiz availability
  const [quizAvailability, setQuizAvailability] = useState<Record<string, boolean>>({});
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);

  // Update quiz availability when sessions, quizzes, or history change
  useEffect(() => {
    if (availableQuizzes.length > 0 && mySessions.length > 0) {
      const newAvailability: Record<string, boolean> = {};
      availableQuizzes.forEach(quiz => {
        newAvailability[quiz._id] = isQuizAvailable(quiz);
      });
      setQuizAvailability(newAvailability);
      console.log('🔄 [Quiz Availability] Updated:', newAvailability);
    }
  }, [availableQuizzes, mySessions, quizHistory]);

  // Fetch student's enrolled sessions
  useEffect(() => {
    const fetchMySessions = async () => {
      if (!user?._id) return;

      try {
        setLoadingSessions(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sessions?student=${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('🔍 [StudentDashboard] Sessions API response:', result);

          const sessions = result.data?.sessions || [];
          console.log('🔍 [StudentDashboard] Found sessions:', sessions.length);

          if (sessions.length === 0) {
            console.log('ℹ️ [StudentDashboard] No sessions found for student');
          }

          // Debug: Check session data structure
          console.log('🔍 [StudentDashboard] Sample session data:', sessions[0]);
          console.log('🔍 [StudentDashboard] Session quizAccessEnabled fields:', sessions.map(s => ({
            title: s.title,
            status: s.status,
            quizAccessEnabled: s.quizAccessEnabled,
            courseId: s.course?._id
          })));

          // Get unique courses from sessions with safety checks
          const uniqueCourses = sessions.reduce((acc: any[], session: any) => {
            // Safety check: ensure session.course exists and has required fields
            if (!session.course || !session.course._id) {
              console.warn('⚠️ Session missing course data:', session);
              return acc;
            }

            const courseId = session.course._id;
            if (!acc.find(c => c._id === courseId)) {
              // Ensure instructor data exists, provide fallback if missing
              const courseData = {
                ...session.course,
                instructor: session.course.instructor || {
                  firstName: 'Instructeur',
                  lastName: 'Non défini',
                  _id: 'unknown'
                },
                // Session-specific data
                sessionCount: sessions.filter((s: any) => s.course?._id === courseId).length,
                lastSession: sessions.filter((s: any) => s.course?._id === courseId)
                  .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0],
                // Progress based on sessions
                progress: 0, // Will be calculated based on completed sessions
                status: 'En cours',
                nextLesson: 'Continuer',
                enrollmentId: session._id,
                // Session-based lesson count
                completedLessons: sessions.filter((s: any) => s.course?._id === courseId && s.status === 'completed').length,
                totalLessons: sessions.filter((s: any) => s.course?._id === courseId).length,
                // Last activity from sessions
                lastActivity: (() => {
                  const sortedSessions = sessions.filter((s: any) => s.course?._id === courseId)
                    .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                  return sortedSessions[0]?.startTime
                    ? new Date(sortedSessions[0].startTime).toLocaleDateString('fr-FR')
                    : null;
                })()
              };

              acc.push(courseData);
            }
            return acc;
          }, []);

          console.log('🔍 [StudentDashboard] Processed unique courses:', uniqueCourses);
          console.log('🔍 [StudentDashboard] Raw sessions data:', sessions);
          setMySessions(sessions); // Store raw sessions
          setMyCourses(uniqueCourses); // Store processed courses
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchMySessions();
  }, [user?._id]);

  // Fetch quizzes for completed sessions
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user?._id || mySessions.length === 0) return;

      try {
        setLoadingQuizzes(true);

        // Get completed sessions
        const completedSessions = mySessions.filter(session => session.status === 'completed');

        if (completedSessions.length === 0) {
          setAvailableQuizzes([]);
          setQuizHistory([]);
          return;
        }

        // Get unique course IDs from completed sessions
        const courseIds = [...new Set(completedSessions.map(session => session.course._id))];

        // Fetch quizzes for completed sessions using the correct API endpoint
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quizzes?courses=${courseIds.join(',')}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            console.log('🔍 [StudentDashboard] Quizzes API response:', result);

            if (result.success && result.data?.quizzes) {
              const quizzes = result.data.quizzes.map(quiz => ({
                ...quiz,
                courseTitle: myCourses.find(c => c._id === quiz.course)?.title || 'Cours inconnu',
                instructorName: quiz.teacher ? `${quiz.teacher.firstName} ${quiz.teacher.lastName}` : 'Instructeur inconnu'
              }));

              console.log('🔍 [StudentDashboard] Processed quizzes:', quizzes);
              setAvailableQuizzes(quizzes);
            } else {
              console.log('ℹ️ [StudentDashboard] No quizzes found or API error');
              setAvailableQuizzes([]);
            }
          } else {
            console.error('❌ [StudentDashboard] Failed to fetch quizzes:', response.status);
            setAvailableQuizzes([]);
          }
        } catch (error) {
          console.error('❌ [StudentDashboard] Error fetching quizzes:', error);
          setAvailableQuizzes([]);
        }

        // Fetch quiz history from the new endpoint
        try {
          const historyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quizzes/attempts/history`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (historyResponse.ok) {
            const historyResult = await historyResponse.json();
            console.log('🔍 [StudentDashboard] Quiz history response:', historyResult);

            if (historyResult.success && historyResult.data) {
              setQuizHistory(historyResult.data);
              console.log('✅ [StudentDashboard] Quiz history loaded:', historyResult.data.length, 'attempts');
            } else {
              console.log('ℹ️ [StudentDashboard] No quiz history found');
              setQuizHistory([]);
            }
          } else {
            console.error('❌ [StudentDashboard] Failed to fetch quiz history:', historyResponse.status);
            setQuizHistory([]);
          }
        } catch (error) {
          console.error('❌ [StudentDashboard] Error fetching quiz history:', error);
          setQuizHistory([]);
        }

      } catch (error) {
        console.error('❌ [StudentDashboard] Error in quiz fetching:', error);
        setAvailableQuizzes([]);
        setQuizHistory([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, [user?._id, mySessions, myCourses]);

  // Quiz timer effect
  useEffect(() => {
    if (!isTakingQuiz || quizTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setQuizTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up! Auto-submit quiz
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTakingQuiz, quizTimeLeft]);

  // Function to handle course continuation - redirect to meeting link if available
  const handleContinueCourse = (course: any) => {
    console.log('🔍 [handleContinueCourse] Called with course:', course);
    console.log('🔍 [handleContinueCourse] mySessions length:', mySessions.length);
    console.log('🔍 [handleContinueCourse] mySessions sample:', mySessions.slice(0, 2));

    // Safety check: ensure course has valid ID
    if (!course || !course._id) {
      console.error('❌ Invalid course data:', course);
      toast({
        title: "Erreur",
        description: "Données de cours invalides.",
        variant: "destructive"
      });
      return;
    }

    // Find the student's session for this course with safety checks
    const courseSessions = mySessions.filter((s: any) => {
      // Safety check: ensure session and course exist
      if (!s || !s.course || !s.course._id) {
        console.warn('⚠️ Session with invalid course data:', s);
        return false;
      }
      return s.course._id === course._id;
    });

    console.log('🔍 [handleContinueCourse] Course ID:', course._id);
    console.log('🔍 [handleContinueCourse] Found sessions:', courseSessions.length);

    if (courseSessions.length > 0) {
      // Get the most recent session with a meeting link
      const sessionWithMeeting = courseSessions
        .filter((s: any) => s.meetingLink && s.meetingLink.trim() !== '')
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

      if (sessionWithMeeting && sessionWithMeeting.meetingLink) {
        // Redirect to the meeting link
        console.log('🔗 Redirecting to meeting:', sessionWithMeeting.meetingLink);
        window.open(sessionWithMeeting.meetingLink, '_blank');
      } else {
        // No meeting link available, show message
        console.log('ℹ️ No meeting link found for course:', course._id);
        toast({
          title: "Aucun lien de réunion",
          description: "Aucun lien de réunion n'est disponible pour ce cours pour le moment.",
          variant: "destructive"
        });
      }
    } else {
      // No sessions found
      console.log('ℹ️ No sessions found for course:', course._id);
      toast({
        title: "Aucune session",
        description: "Aucune session trouvée pour ce cours.",
        variant: "destructive"
      });
    }
  };

  // Function to check if a quiz is available for the student
  const isQuizAvailable = (quiz: any) => {
    // Extract course ID from quiz - handle both string and object formats
    let courseId = null;
    if (typeof quiz.course === 'string') {
      courseId = quiz.course;
    } else if (quiz.course && quiz.course._id) {
      courseId = quiz.course._id;
    } else if (quiz.courseId) {
      courseId = quiz.courseId;
    }

    if (!courseId) {
      console.log('❌ [isQuizAvailable] No course ID found for quiz:', quiz.title);
      return false;
    }

    console.log('🔍 [isQuizAvailable] Checking quiz:', quiz.title, 'for course:', courseId);
    console.log('🔍 [isQuizAvailable] Quiz data:', quiz);
    console.log('🔍 [isQuizAvailable] My sessions:', mySessions);

    // Check if student has already completed this quiz
    const hasAlreadyCompleted = quizHistory.some(attempt => {
      const attemptQuizId = attempt.quiz?.id || attempt.quiz?._id || attempt.quizId;
      const isCompleted = attemptQuizId === quiz._id;

      if (isCompleted) {
        console.log('🚫 [isQuizAvailable] Student has already completed quiz:', quiz.title);
      }

      return isCompleted;
    });

    if (hasAlreadyCompleted) {
      console.log('❌ [isQuizAvailable] Quiz already completed:', quiz.title);
      return false;
    }

    // Must have a completed session for this course AND teacher must have enabled quiz access for at least one of those sessions
    const isAvailable = mySessions.some(session => {
      const sessionCourseId = session.course?._id || session.course;
      const hasCompletedSession = sessionCourseId === courseId && session.status === 'completed' && session.quizAccessEnabled === true;

      console.log('🔍 [isQuizAvailable] Session:', session.title, 'Course:', sessionCourseId, 'Status:', session.status, 'QuizAccess:', session.quizAccessEnabled, 'Match:', hasCompletedSession);
      console.log('🔍 [isQuizAvailable] Course ID comparison:', { sessionCourseId, courseId, match: sessionCourseId === courseId });

      return hasCompletedSession;
    });

    console.log('✅ [isQuizAvailable] Quiz', quiz.title, 'is available:', isAvailable);
    return isAvailable;
  };

  // Function to handle starting a quiz
  const handleStartQuiz = async (quiz: any) => {
    if (startingQuizId) return;
    setStartingQuizId(quiz?._id || null);
    console.log('🔍 [handleStartQuiz] Starting quiz:', quiz);

    // Check if quiz has required data
    if (!quiz || !quiz._id) {
      toast({
        title: "Erreur",
        description: "Données de quiz invalides.",
        variant: "destructive"
      });
      setStartingQuizId(null);
      return;
    }

    // Check if student has completed sessions for this course  
    // Extract course ID from quiz - handle both string and object formats
    let courseId = null;
    if (typeof quiz.course === 'string') {
      courseId = quiz.course;
    } else if (quiz.course && quiz.course._id) {
      courseId = quiz.course._id;
    } else if (quiz.courseId) {
      courseId = quiz.courseId;
    }

    if (!courseId) {
      toast({
        title: "Erreur",
        description: "Quiz sans cours associé.",
        variant: "destructive"
      });
      setStartingQuizId(null);
      return;
    }

    const hasCompletedSessions = mySessions.some(session =>
      session.course._id === courseId && session.status === 'completed'
    );

    if (!hasCompletedSessions) {
      toast({
        title: "Quiz non disponible",
        description: "Vous devez compléter une session de ce cours avant de pouvoir passer le quiz.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Always re-validate against latest sessions from server for this course
      // courseId is already extracted above, use the same value
      if (!courseId) {
        toast({ title: "Erreur", description: "Quiz sans cours associé.", variant: "destructive" });
        return;
      }

      const latestSessionsResp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sessions?student=${user?._id}&course=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (latestSessionsResp.ok) {
        const latest = await latestSessionsResp.json();
        const sessionsForCourse = latest.data?.sessions || [];
        const hasCompletedWithQuiz = sessionsForCourse.some((s: any) => s.status === 'completed' && s.quizAccessEnabled === true);

        if (!hasCompletedWithQuiz) {
          toast({
            title: "Quiz non disponible",
            description: "L'accès au quiz n'est pas autorisé pour cette session par l'enseignant.",
            variant: "destructive"
          });
          setStartingQuizId(null);
          return;
        }
      }

      // First, start a quiz attempt to get an attempt ID
      const startResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quizzes/${quiz._id}/attempts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json().catch(() => ({}));
        console.error('❌ [handleStartQuiz] Backend error:', errorData);

        if (startResponse.status === 400) {
          toast({
            title: "Erreur d'accès",
            description: errorData.message || "Vous n'êtes pas autorisé à passer ce quiz. Contactez votre instructeur.",
            variant: "destructive"
          });
        } else {
          throw new Error(`Failed to start quiz attempt: HTTP ${startResponse.status}`);
        }
        setStartingQuizId(null);
        return;
      }

      const startResult = await startResponse.json();
      if (!startResult.success || !startResult.data?.attempt?.id) {
        throw new Error('Failed to start quiz attempt');
      }

      const attemptId = startResult.data.attempt.id;

      // Now fetch the full quiz data (without correct answers)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quizzes/${quiz._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const fullQuiz = result.data;

          // Initialize quiz taking state
          setCurrentQuiz(fullQuiz);
          setCurrentAttemptId(attemptId);
          setQuizAnswers(new Array(fullQuiz.questions.length).fill(null));
          setQuizTimeLeft(fullQuiz.timeLimit * 60); // Convert minutes to seconds
          setQuizStartTime(new Date());
          setIsTakingQuiz(true);

          toast({
            title: "Quiz démarré !",
            description: `Vous avez ${fullQuiz.timeLimit} minutes pour compléter ce quiz.`,
          });
        } else {
          throw new Error('Failed to fetch quiz data');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [handleStartQuiz] Error starting quiz:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le quiz. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setStartingQuizId(null);
    }
  };

  // Function to handle quiz submission
  const handleSubmitQuiz = async () => {
    if (!currentQuiz || !quizStartTime) return;

    try {
      const timeSpent = Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000);

      // Now submit the quiz attempt with the attempt ID
      const submitResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quizzes/${currentQuiz._id}/attempts/${currentAttemptId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: quizAnswers.map((answer, index) => ({
            questionIndex: index,
            answer: answer
          })),
          timeSpent
        })
      });

      if (submitResponse.ok) {
        const result = await submitResponse.json();
        if (result.success) {
          const score = result.data.score || 0;
          const totalQuestions = result.data.answers?.length || currentQuiz.questions.length;
          const passed = result.data.passed || false;

          toast({
            title: passed ? "Quiz réussi ! 🎉" : "Quiz terminé",
            description: `Score: ${score}/${totalQuestions} (${Math.round((score / totalQuestions) * 100)}%)`,
          });

          // Reset quiz state
          setIsTakingQuiz(false);
          setCurrentQuiz(null);
          setCurrentAttemptId(null);
          setQuizAnswers([]);
          setQuizTimeLeft(0);
          setQuizStartTime(null);

          // Refresh quiz history to show the new completed attempt
          console.log('🔄 [handleSubmitQuiz] Refreshing quiz history...');
          try {
            const historyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quizzes/attempts/history`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });

            if (historyResponse.ok) {
              const historyResult = await historyResponse.json();
              if (historyResult.success && historyResult.data) {
                setQuizHistory(historyResult.data);
                console.log('✅ [handleSubmitQuiz] Quiz history refreshed:', historyResult.data.length, 'attempts');
              }
            }
          } catch (error) {
            console.error('❌ [handleSubmitQuiz] Error refreshing history:', error);
          }
        } else {
          throw new Error(result.message || 'Failed to submit quiz');
        }
      } else {
        throw new Error(`HTTP ${submitResponse.status}`);
      }
    } catch (error) {
      console.error('❌ [handleSubmitQuiz] Error submitting quiz:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre le quiz. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Function to handle answer selection
  const handleAnswerSelect = (questionIndex: number, answer: any) => {
    setQuizAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answer;
      return newAnswers;
    });
  };

  // Function to exit quiz
  const handleExitQuiz = () => {
    if (confirm('Êtes-vous sûr de vouloir quitter le quiz ? Votre progression sera perdue.')) {
      setIsTakingQuiz(false);
      setCurrentQuiz(null);
      setCurrentAttemptId(null);
      setQuizAnswers([]);
      setQuizTimeLeft(0);
      setQuizStartTime(null);
    }
  };

  const handleEnrollInCourse = async (courseId: string) => {
    try {
      await enrollInCourse(courseId);
      toast({
        title: "Inscription réussie !",
        description: "Vous êtes maintenant inscrit à ce cours"
      });
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: "Impossible de s'inscrire au cours",
        variant: "destructive"
      });
    }
  };

  // Loading states
  const isLoading = loading.courses || loading.enrollments || loading.dashboardStats;
  const hasErrors = Object.values(errors).some(error => error !== null);

  // Error handling
  if (hasErrors) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorState
            error="Impossible de charger les données du tableau de bord"
            onRetry={() => {
              refreshCourses();
              refreshEnrollments();
              refreshDashboardStats();
            }}
            title="Erreur de chargement"
          />
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Header />

        {/* Quiz Taking Interface */}
        {isTakingQuiz && currentQuiz && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Quiz Header */}
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{currentQuiz.title}</h1>
                    <p className="text-primary-foreground/80">{currentQuiz.courseTitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-primary-foreground/80">Temps restant</div>
                  </div>
                </div>
              </div>

              {/* Quiz Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {currentQuiz.questions.map((question: any, index: number) => (
                  <div key={index} className="mb-8 p-6 border border-border rounded-xl bg-muted/30">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Type: {question.type === 'multiple-choice' ? 'Choix multiple' :
                            question.type === 'true-false' ? 'Vrai/Faux' :
                              question.type === 'short-answer' ? 'Réponse courte' : 'Dissertation'}
                        </p>

                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-3">
                            {question.options.map((option: string, optionIndex: number) => (
                              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={option}
                                  checked={quizAnswers[index] === option}
                                  onChange={() => handleAnswerSelect(index, option)}
                                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'true-false' && (
                          <div className="space-y-3">
                            {['Vrai', 'Faux'].map((option) => (
                              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={option}
                                  checked={quizAnswers[index] === option}
                                  onChange={() => handleAnswerSelect(index, option)}
                                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'short-answer' && (
                          <input
                            type="text"
                            placeholder="Tapez votre réponse..."
                            value={quizAnswers[index] || ''}
                            onChange={(e) => handleAnswerSelect(index, e.target.value)}
                            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        )}

                        {question.type === 'essay' && (
                          <textarea
                            placeholder="Tapez votre réponse détaillée..."
                            value={quizAnswers[index] || ''}
                            onChange={(e) => handleAnswerSelect(index, e.target.value)}
                            rows={4}
                            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz Footer */}
              <div className="border-t border-border p-6 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {quizAnswers.filter(answer => answer !== null).length} / {currentQuiz.questions.length} questions répondues
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleExitQuiz}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Quitter
                    </Button>
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={quizAnswers.filter(answer => answer !== null).length === 0}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Terminer le quiz
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 border border-border/50 shadow-lg">
              <div className="flex items-center gap-6 mb-6">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Salut <span className="text-primary">{user?.firstName || 'Étudiant'}</span> ! 👋
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {user?.lastLoginAt ?
                      `Dernière connexion: ${new Date(user.lastLoginAt).toLocaleDateString('fr-FR')}` :
                      'Bienvenue sur votre tableau de bord !'
                    }
                  </p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground">
                Prêt à continuer ton aventure de codage aujourd'hui ?
              </p>
            </div>
          </div>

          {/* Enhanced Dashboard with Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-border/50 shadow-lg">
              <TabsList className="grid w-full grid-cols-2 bg-transparent">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="courses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Enhanced My Courses */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-200/50">
                      <CardTitle className="flex items-center gap-3 text-green-900">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">Mes cours</div>
                          <div className="text-green-700 text-sm font-medium">Suivez votre progression</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loadingSessions ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 bg-white/80 rounded-xl border border-green-200/50 mb-4 last:mb-0">
                            <div className="w-12 h-12 bg-green-200 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-green-200 rounded animate-pulse" />
                              <div className="h-3 bg-green-200 rounded w-1/2 animate-pulse" />
                              <div className="h-2 bg-green-200 rounded-full animate-pulse" />
                            </div>
                          </div>
                        ))
                      ) : myCourses && myCourses.length > 0 ? (
                        myCourses.filter(course => course && course._id && course.title).map((course) => (
                          <div key={course._id} className="flex items-center space-x-4 p-4 bg-white/80 rounded-xl border border-green-200/50 mb-4 last:mb-0 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            {/* Course Icon - Stack of books with colors */}
                            <div className="relative w-12 h-12 flex items-center justify-center">
                              <div className="absolute bottom-0 w-8 h-6 bg-blue-500 rounded-sm"></div>
                              <div className="absolute bottom-1 w-8 h-6 bg-red-500 rounded-sm"></div>
                              <div className="absolute bottom-2 w-8 h-6 bg-green-500 rounded-sm"></div>
                            </div>

                            {/* Course Details */}
                            <div className="flex-1">
                              <h3 className="font-semibold text-green-900 text-lg">{course.title}</h3>
                              <p className="text-sm text-gray-600">Par {course.instructor?.firstName || 'Instructeur'} {course.instructor?.lastName || 'Non défini'}</p>
                            </div>

                            {/* Status and Action */}
                            <div className="flex flex-col items-end gap-3">
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 border-green-300 px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {course.status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleContinueCourse(course)}
                                className="border-green-300 text-green-700 hover:bg-green-50 bg-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-md"
                              >
                                <Play className="w-3 h-3" />
                                Rejoindre
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState
                          title="Aucun cours inscrit"
                          description="Commencez par vous inscrire à un cours pour voir votre progression ici."
                          icon={BookOpen}
                          action={
                            <Button onClick={() => setActiveTab("courses")} className="bg-green-600 hover:bg-green-700">
                              Découvrir les cours
                            </Button>
                          }
                        />
                      )}
                    </CardContent>
                  </Card>



                  {/* Available Quizzes Section */}
                  <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-200/50">
                      <CardTitle className="flex items-center gap-3 text-orange-900">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Trophy className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">Quiz disponibles</div>
                          <div className="text-orange-700 text-sm font-medium">Testez vos connaissances sur vos cours</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loadingQuizzes ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 bg-white/80 rounded-xl border border-orange-200/50 mb-4 last:mb-0">
                            <div className="w-12 h-12 bg-orange-200 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-orange-200 rounded animate-pulse" />
                              <div className="h-3 bg-orange-200 rounded w-1/2 animate-pulse" />
                              <div className="h-2 bg-orange-200 rounded-full animate-pulse" />
                            </div>
                          </div>
                        ))
                      ) : availableQuizzes && availableQuizzes.length > 0 ? (
                        availableQuizzes.map((quiz) => {
                          const isAvailable = quizAvailability[quiz._id] || false;
                          return (
                            <div key={quiz._id} className={`flex items-center space-x-4 p-4 rounded-xl border mb-4 last:mb-0 transition-all duration-300 ${isAvailable
                              ? 'bg-white/80 border-orange-200/50 hover:shadow-lg hover:scale-[1.02]'
                              : 'bg-gray-100/80 border-gray-300/50 opacity-60'
                              }`}>
                              <div className="text-4xl">🏆</div>
                              <div className="flex-1">
                                <h3 className={`font-semibold ${isAvailable ? 'text-orange-900' : 'text-gray-600'}`}>
                                  {quiz.title}
                                </h3>
                                <p className={`text-sm ${isAvailable ? 'text-orange-700' : 'text-gray-500'}`}>
                                  {quiz.courseTitle}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {quiz.totalPoints || 1} points • {quiz.timeLimit || 60} min
                                  {quiz.questions && quiz.questions.length > 0 && ` • ${quiz.questions.length} questions`}
                                </p>
                                {!isAvailable && (
                                  <p className="text-xs text-red-600 mt-1">
                                    ⚠️ Complétez d'abord une session de ce cours
                                  </p>
                                )}
                              </div>
                              <Button
                                onClick={() => handleStartQuiz(quiz)}
                                disabled={!isAvailable || startingQuizId === quiz._id}
                                className={`px-4 py-2 rounded-lg ${isAvailable
                                  ? (startingQuizId === quiz._id ? 'bg-orange-400 text-white cursor-wait' : 'bg-orange-500 hover:bg-orange-600 text-white')
                                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  }`}
                              >
                                {isAvailable ? (startingQuizId === quiz._id ? 'Chargement…' : 'Commencer') : 'Non disponible'}
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🏆</div>
                          <p className="text-orange-700 font-medium mb-2">Aucun quiz disponible pour le moment</p>
                          <p className="text-orange-600 text-sm">Complétez vos sessions pour débloquer les quiz !</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quiz History Section */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-200/50">
                      <CardTitle className="flex items-center gap-3 text-green-900">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">Historique des quiz</div>
                          <div className="text-green-700 text-sm font-medium">Vos résultats et progrès</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loadingQuizzes ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 bg-white/80 rounded-xl border border-green-200/50 mb-4 last:mb-0">
                            <div className="w-12 h-12 bg-green-200 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-green-200 rounded animate-pulse" />
                              <div className="h-3 bg-green-200 rounded w-1/2 animate-pulse" />
                              <div className="h-2 bg-green-200 rounded-full animate-pulse" />
                            </div>
                          </div>
                        ))
                      ) : quizHistory && quizHistory.length > 0 ? (
                        quizHistory.map((result) => (
                          <div key={result._id} className="flex items-center space-x-4 p-4 bg-white/80 rounded-xl border border-green-200/50 mb-4 last:mb-0">
                            <div className="text-4xl">🎯</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-green-900">{result.quizTitle || result.quiz?.title || 'Quiz inconnu'}</h3>
                              <p className="text-sm text-green-700">{result.courseTitle || result.quiz?.course?.title || 'Cours inconnu'}</p>
                              <p className="text-xs text-gray-500">
                                Score: {result.score || 0}/{result.totalQuestions || result.quiz?.questions?.length || 0} •
                                {result.completedAt ? new Date(result.completedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`px-3 py-1 rounded-full text-xs font-medium ${(result.score || 0) >= ((result.totalQuestions || result.quiz?.questions?.length || 1) * 0.8)
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : (result.score || 0) >= ((result.totalQuestions || result.quiz?.questions?.length || 1) * 0.6)
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  : 'bg-red-100 text-red-800 border-red-300'
                                }`}
                            >
                              {(result.score || 0) >= ((result.totalQuestions || result.quiz?.questions?.length || 1) * 0.8) ? 'Excellent' :
                                (result.score || 0) >= ((result.totalQuestions || result.quiz?.questions?.length || 1) * 0.6) ? 'Bon' : 'À améliorer'}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🏆</div>
                          <p className="text-green-700 font-medium mb-2">Aucun quiz complété pour le moment</p>
                          <p className="text-green-600 text-sm">Commencez par passer vos premiers quiz pour voir vos résultats ici !</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>


                  {/* My Courses Section */}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Add sidebar content here if needed */}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              {/* Enhanced Messages Center */}
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border-b border-indigo-200/50">
                  <CardTitle className="flex items-center gap-3 text-indigo-900">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">Centre de messagerie</div>
                      <div className="text-indigo-700 text-sm font-medium">Communiquez avec vos formateurs</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <MessagingCenter userType="student" currentUserId={user?._id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering StudentDashboard:", error);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorState
            error="Une erreur inattendue est survenue."
            onRetry={() => {
              refreshCourses();
              refreshEnrollments();
              refreshDashboardStats();
            }}
            title="Erreur de chargement"
          />
        </div>
      </div>
    );
  }
};

export default StudentDashboard;