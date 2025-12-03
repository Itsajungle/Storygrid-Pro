import { Link, useLocation } from 'react-router-dom';
import { 
  Lightbulb, 
  Film, 
  FileText, 
  CheckCircle, 
  Calendar,
  LayoutDashboard 
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Import IAJ Logo
import logo from '/Assets/IAJ Orange White copy.png';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ideas', label: 'Ideas Lab', icon: Lightbulb },
  { path: '/storyboard', label: 'Storyboard', icon: Film },
  { path: '/script', label: 'Script', icon: FileText },
  { path: '/fact-check', label: 'Fact Check', icon: CheckCircle },
  { path: '/timeline', label: 'Timeline', icon: Calendar },
];

// Apple Blue Glassmorphism Styles
const navStyles = {
  navbar: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
  },
  logoFilter: {
    filter: 'hue-rotate(190deg) saturate(0.8) brightness(1.1)',
    height: '28px',
    width: 'auto',
  },
};

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="h-16" style={navStyles.navbar}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={logo} 
              alt="It's a Jungle" 
              style={navStyles.logoFilter}
            />
            <span 
              className="text-lg font-bold"
              style={{ color: '#1D1D1F' }}
            >
              StoryGridPro
            </span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.02]',
                    isActive
                      ? ''
                      : ''
                  )}
                  style={isActive ? {
                    background: 'rgba(0, 122, 255, 0.9)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(0, 122, 255, 0.35)',
                  } : {
                    background: 'rgba(255, 255, 255, 0.6)',
                    color: '#1D1D1F',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
