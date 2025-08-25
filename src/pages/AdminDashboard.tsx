import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import UserManagementModal from "@/components/UserManagementModal";
import CourseManagementModal from "@/components/CourseManagementModal";
import CertificateManagementModal from "@/components/CertificateManagementModal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SearchFilter } from "@/components/ui/search-filter";
import { PaginationControls } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { useAppData } from "@/hooks/useAppData";
import { Users, BookOpen, Award, TrendingUp, Check, X, Eye, Shield, UserCheck, CreditCard, Euro, RefreshCw, UserCheck as UserCheckIcon, Clock, Calendar, ArrowRight } from "lucide-react";
import { adminAPI } from "@/services/api";


const AdminDashboard = () => {
  const { users, courses, enrollments, payments, updateUser, updateCourse, approveUser, rejectUser, loading } = useAppData();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'payments' | 'teachers'>('overview');
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Fetch real dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
        console.log('📊 [Admin Dashboard] Revenue from payments collection:', response.data?.revenue);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Ensure data is arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  // Get real stats from dashboard data or fallback to calculated stats
  // Vérification de sécurité pour toutes les données
  const totalUsers = dashboardStats?.users?.total || (safeUsers && Array.isArray(safeUsers) ? safeUsers.length : 0);
  const totalCourses = dashboardStats?.courses?.total || (safeCourses && Array.isArray(safeCourses) ? safeCourses.length : 0);
  const totalEnrollments = dashboardStats?.enrollments?.total || (safeEnrollments && Array.isArray(safeEnrollments) ? safeEnrollments.length : 0);
  const completedEnrollments = dashboardStats?.enrollments?.completed || (safeEnrollments && Array.isArray(safeEnrollments) ? safeEnrollments.filter(e => e.completed).length : 0);
  const successRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  // Calculate teacher approval stats from real data with safety checks
  const pendingTeachers = safeUsers && Array.isArray(safeUsers) ? safeUsers.filter(u => u.role === 'teacher' && u.teacherApprovalStatus === 'pending').length : 0;
  const approvedTeachers = safeUsers && Array.isArray(safeUsers) ? safeUsers.filter(u => u.role === 'teacher' && u.teacherApprovalStatus === 'approved').length : 0;
  const totalTeachers = safeUsers && Array.isArray(safeUsers) ? safeUsers.filter(u => u.role === 'teacher').length : 0;

  // Payment statistics from real data with safety checks
  // Always prioritize backend calculation from payments collection
  const totalRevenue = dashboardStats?.revenue?.total ||
    (safePayments && Array.isArray(safePayments)
      ? safePayments
        .filter(p => p.status === 'completed' || p.status === 'reussi')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
      : 0);

  const monthlyRevenue = dashboardStats?.revenue?.monthly || 0;
  const totalPayments = dashboardStats?.revenue?.payments ||
    (safePayments && Array.isArray(safePayments)
      ? safePayments.filter(p => p.status === 'completed' || p.status === 'reussi').length
      : 0);

  // Calculate revenue by payment type from payments collection
  const sessionBookingRevenue = safePayments && Array.isArray(safePayments)
    ? safePayments
      .filter(p => p.paymentType === 'session_booking' && (p.status === 'completed' || p.status === 'reussi'))
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  const courseEnrollmentRevenue = safePayments && Array.isArray(safePayments)
    ? safePayments
      .filter(p => p.paymentType === 'course_enrollment' && (p.status === 'completed' || p.status === 'reussi'))
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  // Log revenue calculation for verification
  console.log('💰 [Revenue Calculation] Total from payments collection:', totalRevenue);
  console.log('📅 [Revenue Calculation] Session bookings:', sessionBookingRevenue);
  console.log('📚 [Revenue Calculation] Course enrollments:', courseEnrollmentRevenue);

  const stats = [
    { title: "Utilisateurs Totaux", value: totalUsers.toString(), icon: Users, change: "+12%", color: "primary" },
    { title: "Cours Actifs", value: totalCourses.toString(), icon: BookOpen, change: "+5%", color: "accent" },
    { title: "Inscriptions", value: totalEnrollments.toString(), icon: Award, change: "+23%", color: "success" },
    { title: "Taux de Réussite", value: `${successRate}%`, icon: TrendingUp, change: "+3%", color: "warning" },
    { title: "Formateurs en attente", value: pendingTeachers.toString(), icon: Clock, change: "", color: "warning" },
    { title: "Formateurs approuvés", value: approvedTeachers.toString(), icon: UserCheckIcon, change: "", color: "success" }
  ];

  // Search and filter configurations
  const userFilters = [
    {
      key: 'status',
      label: 'Status',
      values: [
        { value: 'pending', label: 'En attente', count: safeUsers.filter(u => u.teacherApprovalStatus === 'pending').length },
        { value: 'approved', label: 'Approuvé', count: safeUsers.filter(u => u.teacherApprovalStatus === 'approved').length },
        { value: 'rejected', label: 'Rejeté', count: safeUsers.filter(u => u.teacherApprovalStatus === 'rejected').length },
      ]
    },
    {
      key: 'role',
      label: 'Role',
      values: [
        { value: 'student', label: 'Élève', count: safeUsers.filter(u => u.role === 'student').length },
        { value: 'teacher', label: 'Formateur', count: safeUsers.filter(u => u.role === 'teacher').length },
        { value: 'admin', label: 'Admin', count: safeUsers.filter(u => u.role === 'admin').length },
      ]
    }
  ];

  const courseFilters = [
    {
      key: 'status',
      label: 'Status',
      values: [
        { value: 'draft', label: 'Brouillon', count: safeCourses.filter(c => c.status === 'draft').length },
        { value: 'published', label: 'Publié', count: safeCourses.filter(c => c.status === 'published').length },
        { value: 'pending', label: 'En révision', count: safeCourses.filter(c => c.status === 'pending').length },
      ]
    }
  ];

  // Search hooks
  const userSearch = useSearch({
    data: safeUsers,
    searchFields: ['firstName', 'lastName', 'email'],
    filterFunctions: {
      status: (user, values) => values.includes(user.teacherApprovalStatus),
      role: (user, values) => values.includes(user.role),
    }
  });

  const courseSearch = useSearch({
    data: safeCourses,
    searchFields: ['title', 'description'],
    filterFunctions: {
      status: (course, values) => values.includes(course.status),
    }
  });

  // Pagination hooks
  const userPagination = usePagination({ data: userSearch.filteredData, itemsPerPage: 10 });
  const coursePagination = usePagination({ data: courseSearch.filteredData, itemsPerPage: 8 });
  const paymentPagination = usePagination({ data: safePayments, itemsPerPage: 10 });

  // Add loading state check AFTER all hooks are called
  if (loading.courses || loading.userStats) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleQuickApprove = async (userId: string) => {
    setIsLoading(true);
    try {
      approveUser(userId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReject = async (userId: string) => {
    setIsLoading(true);
    try {
      rejectUser(userId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApproveCourse = async (courseId: number) => {
    setIsLoading(true);
    try {
      updateCourse(courseId, { status: 'published' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRejectCourse = async (courseId: number) => {
    setIsLoading(true);
    try {
      updateCourse(courseId, { status: 'draft' });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />

      <div className="container mx-auto px-4 py-8">


        {/* Enhanced Dashboard Header */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 mb-8 border border-primary/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard Administrateur
              </h1>
              <p className="text-xl text-muted-foreground">Gérez la plateforme GlobCoders avec des outils puissants</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={refreshData}
                disabled={isLoading}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-border/50 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { key: 'users', label: 'Utilisateurs', icon: Users },
              { key: 'courses', label: 'Cours', icon: BookOpen },
              { key: 'payments', label: 'Paiements', icon: CreditCard },
              { key: 'teachers', label: 'Formateurs', icon: UserCheck }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Stats Cards - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-muted/30 border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                {stat.change && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    {stat.change}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enhanced Recent Users Overview */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-green-900">Recent Users</CardTitle>
                      <CardDescription className="text-green-700">Latest user registrations on the platform</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('users')}
                    className="border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {safeUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-green-600 font-medium">No users yet</p>
                    <p className="text-green-500 text-sm">No users have registered on the platform</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeUsers.slice(0, 5).map((user, index) => (
                      <div
                        key={user._id}
                        className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${index % 2 === 0
                          ? 'bg-white border-green-200 hover:border-green-300'
                          : 'bg-green-50/50 border-green-100 hover:border-green-200'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-green-700">
                                    {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'N'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-sm text-gray-600 font-medium">
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="outline"
                                    className={`px-3 py-1 text-xs font-semibold ${user.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                                      : user.role === 'teacher'
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                      }`}
                                  >
                                    {user.role === 'admin' ? '👑 Admin' :
                                      user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`px-3 py-1 text-xs font-semibold ${user.teacherApprovalStatus === 'approved'
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : user.teacherApprovalStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                        : user.teacherApprovalStatus === 'rejected'
                                          ? 'bg-red-100 text-red-800 border-red-200'
                                          : 'bg-gray-100 text-gray-800 border-gray-200'
                                      }`}
                                  >
                                    {user.teacherApprovalStatus === 'approved' ? '✅ Approved' :
                                      user.teacherApprovalStatus === 'pending' ? '⏳ Pending' :
                                        user.teacherApprovalStatus === 'rejected' ? '❌ Rejected' :
                                          'N/A'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                  </span>
                                  {user.lastLoginAt && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Last login: {new Date(user.lastLoginAt).toLocaleDateString('fr-FR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveTab('users')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-green-300 text-green-700 hover:bg-green-100"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {safeUsers.length > 5 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('users')}
                          className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                          View {safeUsers.length - 5} more users
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Recent Courses Overview */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-blue-900">Recent Courses</CardTitle>
                      <CardDescription className="text-blue-700">Latest course submissions from teachers</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('courses')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {safeCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-blue-600 font-medium">No courses yet</p>
                    <p className="text-blue-500 text-sm">Teachers haven't submitted any courses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeCourses.slice(0, 4).map((course, index) => (
                      <div
                        key={course._id}
                        className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${index % 2 === 0
                          ? 'bg-white border-blue-200 hover:border-blue-300'
                          : 'bg-blue-50/50 border-blue-100 hover:border-blue-200'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                  {course.title || 'Untitled Course'}
                                </h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <span className="text-sm text-gray-600 font-medium">
                                      By {course.instructor?.firstName} {course.instructor?.lastName || 'Unknown Teacher'}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={course.status === "published" ? "default" : "secondary"}
                                    className={`px-3 py-1 text-xs font-semibold ${course.status === "published"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      }`}
                                  >
                                    {course.status === "published" ? "✅ Published" : "⏳ Draft"}
                                  </Badge>
                                </div>
                                {course.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {course.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                  </span>
                                  {course.price !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <Euro className="h-3 w-3" />
                                      {course.price === 0 ? 'Free' : `${course.price}€`}
                                    </span>
                                  )}
                                  {course.level && (
                                    <span className="flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" />
                                      {course.level}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveTab('courses')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {safeCourses.length > 4 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('courses')}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          View {safeCourses.length - 4} more courses
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Enhanced User Management Header */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-green-900">Gestion des Utilisateurs</CardTitle>
                      <CardDescription className="text-green-700 text-lg">Gérez tous les utilisateurs de la plateforme</CardDescription>
                    </div>
                  </div>
                  <UserManagementModal trigger={
                    <Button className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Gérer les Utilisateurs
                    </Button>
                  } />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <SearchFilter
                  searchValue={userSearch.searchTerm}
                  onSearchChange={userSearch.setSearchTerm}
                  filters={userFilters}
                  activeFilters={userSearch.activeFilters}
                  onFilterChange={userSearch.updateFilter}
                  placeholder="Rechercher des utilisateurs par nom ou email..."
                />

                {isLoading ? (
                  <div className="py-8">
                    <TableSkeleton rows={5} />
                  </div>
                ) : (
                  <>
                    {userPagination.paginatedData.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-green-900 mb-2">Aucun utilisateur</h3>
                        <p className="text-green-600">Aucun utilisateur n'a encore été enregistré</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30 hover:bg-muted/50">
                                <TableHead className="font-semibold text-foreground px-6 py-4">Utilisateur</TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4 hidden sm:table-cell">Email</TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">Rôle</TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">Statut</TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userPagination.paginatedData.map((user, index) => (
                                <TableRow
                                  key={user._id}
                                  className={`hover:bg-muted/30 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/5'
                                    }`}
                                >
                                  <TableCell className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold text-green-700">
                                          {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'N'}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="font-medium text-foreground">
                                          {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          ID: {user._id}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-6 py-4 hidden sm:table-cell">
                                    <div className="text-muted-foreground">{user.email}</div>
                                  </TableCell>
                                  <TableCell className="px-6 py-4">
                                    <Badge
                                      variant="outline"
                                      className={`px-3 py-1 font-medium ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                                        : user.role === 'teacher'
                                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                                          : 'bg-gray-100 text-gray-800 border-gray-200'
                                        }`}
                                    >
                                      {user.role === 'admin' ? '👑 Admin' :
                                        user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="px-6 py-4">
                                    <Badge
                                      variant="outline"
                                      className={`px-3 py-1 font-medium ${user.teacherApprovalStatus === 'approved'
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : user.teacherApprovalStatus === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                          : user.teacherApprovalStatus === 'rejected'
                                            ? 'bg-red-100 text-red-800 border-red-200'
                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                        }`}
                                    >
                                      {user.teacherApprovalStatus === 'approved' ? '✅ Approved' :
                                        user.teacherApprovalStatus === 'pending' ? '⏳ Pending' :
                                          user.teacherApprovalStatus === 'rejected' ? '❌ Rejected' :
                                            'N/A'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="px-6 py-4">
                                    <div className="flex space-x-2">
                                      {user.role === 'teacher' && user.teacherApprovalStatus === 'pending' && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleQuickApprove(user._id)}
                                            disabled={isLoading}
                                            className="h-8 px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            Approuver
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleQuickReject(user._id)}
                                            disabled={isLoading}
                                            className="h-8 px-3 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                          >
                                            <X className="h-3 w-3 mr-1" />
                                            Rejeter
                                          </Button>
                                        </>
                                      )}
                                      {user.role === 'student' && (
                                        <span className="text-sm text-gray-500 italic">Aucune action requise</span>
                                      )}
                                      {user.role === 'admin' && (
                                        <span className="text-sm text-gray-500 italic">Administrateur</span>
                                      )}
                                      {user.role === 'teacher' && user.teacherApprovalStatus === 'approved' && (
                                        <span className="text-sm text-green-600 font-medium">✅ Approuvé</span>
                                      )}
                                      {user.role === 'teacher' && user.teacherApprovalStatus === 'rejected' && (
                                        <span className="text-sm text-red-600 font-medium">❌ Rejeté</span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Enhanced Pagination */}
                        <div className="p-6 border-t border-border/50 bg-muted/10 rounded-b-xl">
                          <PaginationControls
                            currentPage={userPagination.currentPage}
                            totalPages={userPagination.totalPages}
                            onPageChange={userPagination.goToPage}
                            totalItems={userPagination.totalItems}
                            itemsPerPage={userPagination.itemsPerPage}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Enhanced Course Management Header */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-blue-900">Gestion des Cours</CardTitle>
                      <CardDescription className="text-blue-700 text-lg">Gérez tous les cours disponibles sur la plateforme</CardDescription>
                    </div>
                  </div>
                  <CourseManagementModal trigger={
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Gérer les Cours
                    </Button>
                  } />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <SearchFilter
                  searchValue={courseSearch.searchTerm}
                  onSearchChange={courseSearch.setSearchTerm}
                  filters={courseFilters}
                  activeFilters={courseSearch.activeFilters}
                  onFilterChange={courseSearch.updateFilter}
                  placeholder="Rechercher des cours par titre ou description..."
                />

                {isLoading ? (
                  <div className="py-8">
                    <TableSkeleton rows={5} />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/50">
                            <TableHead className="font-semibold text-foreground px-6 py-4">Cours</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden sm:table-cell">Formateur</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4">Statut</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4">Prix</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {coursePagination.paginatedData.map((course, index) => (
                            <TableRow
                              key={course._id}
                              className={`hover:bg-muted/30 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/5'
                                }`}
                            >
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-foreground mb-1">
                                      {course.title || 'Titre non défini'}
                                    </div>
                                    {course.description && (
                                      <div className="text-sm text-muted-foreground line-clamp-2">
                                        {course.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 hidden sm:table-cell">
                                <div className="text-muted-foreground">
                                  {course.instructor?.firstName} {course.instructor?.lastName || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className={`px-3 py-1 font-medium ${course.status === "published"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    }`}
                                >
                                  {course.status === "published" ? "✅ Publié" : "⏳ Brouillon"}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="flex space-x-2">
                                  {course.status === "draft" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleQuickApproveCourse(parseInt(course._id))}
                                        disabled={isLoading}
                                        className="h-8 px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Publier
                                      </Button>
                                    </>
                                  )}
                                  {course.status === "published" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuickRejectCourse(parseInt(course._id))}
                                      disabled={isLoading}
                                      className="h-8 px-3 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Brouillon
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Enhanced Pagination */}
                    <div className="p-6 border-t border-border/50 bg-muted/10 rounded-b-xl">
                      <PaginationControls
                        currentPage={coursePagination.currentPage}
                        totalPages={coursePagination.totalPages}
                        onPageChange={coursePagination.goToPage}
                        totalItems={coursePagination.totalItems}
                        itemsPerPage={coursePagination.itemsPerPage}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            {/* Enhanced Teacher Management Header */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <UserCheck className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-purple-900">Gestion des Formateurs</CardTitle>
                      <CardDescription className="text-purple-700 text-lg">Approuvez et gérez les candidats formateurs</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="py-8">
                    <TableSkeleton rows={5} />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/50">
                            <TableHead className="font-semibold text-foreground px-6 py-4">Formateur</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden sm:table-cell">Expertise</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4">Statut</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden md:table-cell">Date de candidature</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {safeUsers.filter(u => u.role === 'teacher').slice(0, 10).map((teacher, index) => (
                            <TableRow
                              key={teacher._id}
                              className={`hover:bg-muted/30 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/5'
                                }`}
                            >
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold text-purple-700">
                                      {teacher.firstName?.charAt(0) || 'F'}{teacher.lastName?.charAt(0) || 'N'}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-foreground mb-1">
                                      {teacher.firstName} {teacher.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {teacher.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 hidden sm:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {teacher.expertise?.slice(0, 2).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {teacher.expertise && teacher.expertise.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{teacher.expertise.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className={`px-3 py-1 font-medium ${teacher.teacherApprovalStatus === 'approved'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : teacher.teacherApprovalStatus === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                      : 'bg-red-100 text-red-800 border-red-200'
                                    }`}
                                >
                                  {teacher.teacherApprovalStatus === 'approved' ? '✅ Approuvé' :
                                    teacher.teacherApprovalStatus === 'pending' ? '⏳ En attente' :
                                      '❌ Rejeté'}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 py-4 hidden md:table-cell">
                                <div className="text-sm text-muted-foreground">
                                  {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="flex space-x-2">
                                  {teacher.teacherApprovalStatus === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleQuickApprove(teacher._id)}
                                        disabled={isLoading}
                                        className="h-8 px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Approuver
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleQuickReject(teacher._id)}
                                        disabled={isLoading}
                                        className="h-8 px-3 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Rejeter
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 border-purple-200 text-purple-700 hover:bg-purple-50"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Voir
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {safeUsers.filter(u => u.role === 'teacher').length === 0 && (
                      <div className="text-center py-12">
                        <UserCheck className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-purple-900 mb-2">Aucun formateur</h3>
                        <p className="text-purple-600">Aucun utilisateur n'a encore postulé comme formateur</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Enhanced Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Revenus Totaux</p>
                      <p className="text-3xl font-bold text-green-800">{totalRevenue}€</p>
                      <p className="text-xs text-green-600 mt-1">Tous les temps</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-full">
                      <Euro className="h-8 w-8 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Paiements Réussis</p>
                      <p className="text-3xl font-bold text-blue-800">
                        {safePayments.filter(p => p.status === 'reussi').length}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Transactions validées</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-full">
                      <Check className="h-8 w-8 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700 mb-1">En Attente</p>
                      <p className="text-3xl font-bold text-yellow-800">
                        {safePayments.filter(p => p.status === 'en_attente').length}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">En cours de traitement</p>
                    </div>
                    <div className="p-3 bg-yellow-200 rounded-full">
                      <Clock className="h-8 w-8 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">Taux de Réussite</p>
                      <p className="text-3xl font-bold text-red-800">
                        {totalPayments > 0 ? Math.round((safePayments.filter(p => p.status === 'reussi').length / totalPayments) * 100) : 0}%
                      </p>
                      <p className="text-xs text-red-600 mt-1">Transactions réussies</p>
                    </div>
                    <div className="p-3 bg-red-200 rounded-full">
                      <TrendingUp className="h-8 w-8 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700 mb-1">Sessions Réservées</p>
                      <p className="text-3xl font-bold text-indigo-800">
                        {sessionBookingRevenue}€
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        {safePayments.filter(p => p.paymentType === 'session_booking' && (p.status === 'completed' || p.status === 'reussi')).length} paiements
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-200 rounded-full">
                      <Calendar className="h-8 w-8 text-indigo-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-1">Cours Inscrits</p>
                      <p className="text-3xl font-bold text-purple-800">
                        {courseEnrollmentRevenue}€
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {safePayments.filter(p => p.paymentType === 'course_enrollment' && (p.status === 'completed' || p.status === 'reussi')).length} paiements
                      </p>
                    </div>
                    <div className="p-3 bg-purple-200 rounded-full">
                      <BookOpen className="h-8 w-8 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Payment Table */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Historique des Paiements
                      <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                        💳 Production
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      Suivi complet de toutes les transactions réelles sur la plateforme
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                      <Check className="h-3 w-3 mr-1" />
                      {safePayments.filter(p => p.status === 'reussi').length} réussis
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
                      <X className="h-3 w-3 mr-1" />
                      {safePayments.filter(p => p.status === 'echec').length} échoués
                    </Badge>
                    {process.env.NODE_ENV === 'development' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Actualiser
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8">
                    <TableSkeleton rows={5} />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/50">
                            <TableHead className="font-semibold text-foreground px-6 py-4">Élève</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden sm:table-cell">Cours</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden xl:table-cell">Customer ID</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden lg:table-cell">Type</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden lg:table-cell">Session</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4">Montant</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4">Statut</TableHead>
                            <TableHead className="font-semibold text-foreground px-6 py-4 hidden md:table-cell">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentPagination.paginatedData.map((payment, index) => {
                            // Payment API returns populated user and course objects, not IDs
                            const user = payment.user || safeUsers.find(u => u._id === payment.user_id);
                            const course = payment.course || safeCourses.find(c => c._id === payment.course_id);
                            return (
                              <TableRow
                                key={payment._id}
                                className={`hover:bg-muted/30 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/5'
                                  }`}
                              >
                                <TableCell className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-semibold text-primary">
                                        {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'N/A'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-foreground">
                                        {user ? `${user.firstName} ${user.lastName}` : 'N/A'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 hidden sm:table-cell">
                                  <div className="max-w-[200px]">
                                    <div className="font-medium text-foreground truncate">
                                      {course?.title || 'N/A'}
                                    </div>
                                    {course?.shortDescription && (
                                      <div className="text-sm text-muted-foreground truncate">
                                        {course.shortDescription}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 hidden xl:table-cell">
                                  <div className="font-mono text-xs text-muted-foreground">
                                    {payment.customerId || payment.metadata?.customerId || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 hidden lg:table-cell">
                                  <Badge
                                    variant="outline"
                                    className={`px-2 py-1 text-xs font-medium ${payment.paymentType === 'session_booking'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-purple-100 text-purple-800 border-purple-200'
                                      }`}
                                  >
                                    {payment.paymentType === 'session_booking' ? '📅 Session' : '📚 Cours'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 hidden lg:table-cell">
                                  {payment.session ? (
                                    <div className="max-w-[150px]">
                                      <div className="font-medium text-foreground text-sm truncate">
                                        {payment.session.title || 'Session'}
                                      </div>
                                      {payment.session.startTime && (
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(payment.session.startTime).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit'
                                          })} à {new Date(payment.session.startTime).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-foreground">
                                      {payment.amount}€
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {payment.currency || 'EUR'}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                  <Badge
                                    variant={
                                      (payment.status === 'reussi' || payment.status === 'completed') ? 'default' :
                                        (payment.status === 'en_attente' || payment.status === 'pending') ? 'secondary' : 'destructive'
                                    }
                                    className={`px-3 py-1 font-medium ${(payment.status === 'reussi' || payment.status === 'completed') ? 'bg-green-100 text-green-800 border-green-200' :
                                      (payment.status === 'en_attente' || payment.status === 'pending') ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                        'bg-red-100 text-red-800 border-red-200'
                                      }`}
                                  >
                                    {(payment.status === 'reussi' || payment.status === 'completed') ? '✅ Réussi' :
                                      (payment.status === 'en_attente' || payment.status === 'pending') ? '⏳ En attente' : '❌ Échoué'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 hidden md:table-cell">
                                  <div className="text-sm text-muted-foreground">
                                    {(payment.created_at || payment.createdAt) ? (
                                      <div>
                                        <div className="font-medium">
                                          {new Date(payment.created_at || payment.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                          })}
                                        </div>
                                        <div className="text-xs">
                                          {new Date(payment.created_at || payment.createdAt).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    ) : 'N/A'}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Enhanced Pagination */}
                    <div className="p-6 border-t border-border/50 bg-muted/10">
                      <PaginationControls
                        currentPage={paymentPagination.currentPage}
                        totalPages={paymentPagination.totalPages}
                        onPageChange={paymentPagination.goToPage}
                        totalItems={paymentPagination.totalItems}
                        itemsPerPage={paymentPagination.itemsPerPage}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Certificate Management - Always at bottom */}
        {/* Removed certificate management section as requested */}
      </div>
    </div>
  );
};

export default AdminDashboard;