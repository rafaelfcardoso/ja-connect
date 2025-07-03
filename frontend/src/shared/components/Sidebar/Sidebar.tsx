import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileDown,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  return (
    <div 
      className={`bg-[#FF5722] h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-white/10
        ${collapsed ? 'w-[70px]' : 'w-64'} sticky top-0 left-0`}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        {!collapsed && (
          <div className="flex items-center justify-center w-full mx-auto">
            <img src="/ja_logo.png" alt="JA Distribuidora" className="w-32 h-auto max-h-20" />
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className={`rounded-full p-1 hover:bg-white/10 text-white ${collapsed ? '' : 'absolute right-3'}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-grow py-4">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={({ isActive }) => 
              `flex items-center px-4 py-3 text-white ${isActive ? 'bg-white/20 border-l-4 border-white' : 'hover:bg-white/10'}`
            }>
              <LayoutDashboard size={18} />
              {!collapsed && <span className="ml-3 font-medium text-sm">Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/catalog" className={({ isActive }) => 
              `flex items-center px-4 py-3 text-white ${isActive || location.pathname.startsWith('/catalog/') ? 'bg-white/20 border-l-4 border-white' : 'hover:bg-white/10'}`
            }>
              <Package size={18} />
              {!collapsed && <span className="ml-3 font-medium text-sm">Catálogo</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/downloads" className={({ isActive }) => 
              `flex items-center px-4 py-3 text-white ${isActive ? 'bg-white/20 border-l-4 border-white' : 'hover:bg-white/10'}`
            }>
              <FileDown size={18} />
              {!collapsed && <span className="ml-3 font-medium text-sm">Downloads</span>}
            </NavLink>
          </li>          
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        {/* User Info */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <User size={16} />
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <div className="font-medium text-sm text-white truncate">
                {user?.full_name || 'Usuário'}
              </div>
              <div className="text-xs text-white/70 truncate">
                {user?.email}
              </div>
              {user?.role === 'admin' && (
                <div className="text-xs text-yellow-200 font-medium">
                  Administrador
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/settings'}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors"
            title="Configurações"
          >
            <Settings size={16} className="text-white" />
          </button>
          
          <button
            onClick={logout}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-500/20 transition-colors"
            title="Logout"
          >
            <LogOut size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
