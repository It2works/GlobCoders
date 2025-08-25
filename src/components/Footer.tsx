import { Code, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  const quickLinks = [
    { href: "/courses", label: "Nos cours" },
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" }
  ];

  const legalLinks = [
    { href: "#", label: "Confidentialité" },
    { href: "#", label: "Conditions" },
    { href: "#", label: "Cookies" }
  ];

  return (
    <footer className="bg-gradient-to-br from-primary to-primary-hover text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main footer content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">GlobCoders</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              La plateforme éducative qui inspire la prochaine génération de développeurs et d'experts en IA.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-white transition-colors hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-white/80">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>contact@globcoders.com</span>
              </li>
              <li className="flex items-center space-x-3 text-white/80">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+33 6 64 68 01 63</span>
              </li>
              <li className="flex items-center space-x-3 text-white/80">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-white/80 mb-4">
              Reçois nos dernières actualités et nouveaux cours !
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Ton email"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button className="w-full px-4 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/80 text-sm">
              © 2025 GlobCoders. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;