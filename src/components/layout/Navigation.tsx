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

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ideas', label: 'Ideas Lab', icon: Lightbulb },
  { path: '/storyboard', label: 'Storyboard', icon: Film },
  { path: '/script', label: 'Script', icon: FileText },
  { path: '/fact-check', label: 'Fact Check', icon: CheckCircle },
  { path: '/timeline', label: 'Timeline', icon: Calendar },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Film className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">StoryGridPro</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
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
