import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", label: "Accueil" },
    { href: "/courses", label: "Cours" },
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const handleUserClick = () => {
    if (!user) return;

    // Navigate to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        if (user.adminCertificate?.verified) {
          navigate('/admin-dashboard');
        } else {
          navigate('/admin-certificate');
        }
        break;
      case 'teacher':
        if (user.teacherApprovalStatus === 'approved') {
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
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <img
                src="/lovable-uploads/LOGO Globcoders.png"
                alt="GlobCoders Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GlobCoders
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-muted-foreground hover:text-foreground transition-colors font-medium ${location.pathname === item.href ? "text-primary" : ""
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/register">S'inscrire</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div
                  className="flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={handleUserClick}
                >
                  <User className="w-4 h-4" />
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
                <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-muted-foreground hover:text-foreground transition-colors font-medium ${location.pathname === item.href ? "text-primary" : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {!isAuthenticated ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Se connecter</Link>
                    </Button>
                    <Button variant="hero" asChild>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>S'inscrire</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className="flex items-center space-x-2 text-sm text-muted-foreground py-2 cursor-pointer hover:text-foreground transition-colors"
                      onClick={handleUserClick}
                    >
                      <User className="w-4 h-4" />
                      <span>{user?.firstName} {user?.lastName}</span>
                    </div>
                    <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;