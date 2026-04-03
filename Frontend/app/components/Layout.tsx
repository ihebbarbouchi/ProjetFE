'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  BookOpen,
  FolderOpen,
  PlusCircle,
  Users,
  CheckCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  FileType,
  GraduationCap,
  Layers,
  HelpCircle,
  Database,
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

// ── Props ──────────────────────────────────────────────────
interface LayoutProps {
  children: ReactNode;
  role: 'super-admin' | 'teacher' | 'student';
  onSearch?: (query: string) => void;
}

// ── Composant ──────────────────────────────────────────────
export function Layout({ children, role, onSearch }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token } = useAuth();

  const [sidebarOpen, setSidebarOpen]               = useState(false);
  const [searchQuery, setSearchQuery]               = useState('');
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount]               = useState(0);

  const dropdownRef      = useRef<HTMLDivElement>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);


  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('auth_token')}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      }
    } catch {
      // silently ignore – badge stays at last value
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60_000); // poll every 60 s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Fermer dropdowns au clic extérieur ────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handlers ─────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
    setSettingsDropdownOpen(false);
    setAvatarDropdownOpen(false);
  };

  // ── Navigation par rôle ───────────────────────────────────
  const getNavItems = () => {
    switch (role) {
      case 'super-admin':
        return [
          { icon: Home, label: 'Tableau de bord', path: '/super-admin' },
          { icon: Users, label: 'Gestion des utilisateurs', path: '/super-admin/user-management' },
          { icon: FolderOpen, label: 'Catégories', path: '/super-admin/categories' },
        ];
      case 'teacher':
        return [
          { icon: Home, label: 'Tableau de bord', path: '/teacher' },
          { icon: BookOpen, label: 'Mes ressources', path: '/teacher/resources' },
          { icon: PlusCircle, label: 'Ajouter une ressource', path: '/add-resource' },
          { icon: HelpCircle, label: 'Mes Quiz', path: '/teacher/quiz' },
          { icon: Database, label: 'Bibliothèque QCM', path: '/teacher/qcm-bibliotheque' },
          { icon: FolderOpen, label: 'Catégories', path: '/teacher/categories' },
          { icon: Users, label: 'Mes apprenants', path: '/teacher/students' },
        ];
      case 'student':
        return [
          { icon: Home, label: 'Tableau de bord', path: '/student' },
          { icon: FolderOpen, label: 'Catégories', path: '/student/categories' },
          { icon: BookOpen, label: 'Ressources', path: '/student/resources' },
          { icon: HelpCircle, label: 'Quiz disponibles', path: '/student/quiz' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // ── Infos utilisateur ────────────────────────────────────
  const userName = user?.nom ?? (
    role === 'super-admin' ? 'Super Admin' :
      role === 'teacher' ? 'Enseignant' : 'Apprenant'
  );
  const userEmail = user?.email ?? 'utilisateur@edushare.com';
  const userInitials = user?.nom
    ? user.nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : role === 'super-admin' ? 'SA' : role === 'teacher' ? 'E' : 'A';

  const roleLabel =
    role === 'super-admin' ? 'Administrateur' :
      role === 'teacher' ? 'Enseignant' : 'Apprenant';

  // ── Couleurs par rôle ─────────────────────────────────────
  const accentColor =
    role === 'super-admin' ? 'violet' :
      role === 'teacher' ? 'emerald' : 'blue';

  const activeClass =
    role === 'super-admin' ? 'bg-violet-600 text-white font-semibold shadow-sm' :
      role === 'teacher' ? 'bg-emerald-600 text-white font-semibold shadow-sm' :
        'bg-blue-600 text-white font-semibold shadow-sm';

  const hoverClass =
    role === 'super-admin' ? 'text-gray-700 hover:bg-violet-50 hover:text-violet-600' :
      role === 'teacher' ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' :
        'text-gray-700 hover:bg-blue-50 hover:text-blue-600';

  const avatarBg =
    role === 'super-admin' ? 'bg-violet-100' :
      role === 'teacher' ? 'bg-emerald-100' : 'bg-blue-100';

  const avatarText =
    role === 'super-admin' ? 'text-violet-700' :
      role === 'teacher' ? 'text-emerald-700' : 'text-blue-700';

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div
            className="flex items-center justify-between px-6 border-b border-gray-200"
            style={{ minHeight: '72px', paddingTop: '14px', paddingBottom: '14px' }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${accentColor}-600 rounded-xl flex items-center justify-center shadow-lg shadow-${accentColor}-200`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">EduShare</h1>
                <p className={`text-[10px] font-bold uppercase tracking-wider text-${accentColor}-600 opacity-80`}>
                  {role === 'super-admin' ? 'Administration' :
                    role === 'teacher' ? 'Enseignant' : 'Apprenant'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={index}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${isActive ? activeClass : hoverClass
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-white opacity-80" />
                  )}
                </Link>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">

          {/* Burger mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher des ressources, cours, catégories..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 w-full h-9 text-sm"
              />
            </div>
          </div>

          {/* ── Actions droite ── */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">

            {/* 🔔 Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 hover:text-gray-700"
              onClick={() => { setUnreadCount(0); navigateTo('/notifications'); }}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>

            {/* ⚙️ Paramètres (super-admin uniquement) */}
            {role === 'super-admin' && (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                {settingsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] py-2">
                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Référentiels
                    </p>
                    {[
                      { label: 'Types de ressources', path: '/super-admin/resource-types' },
                      { label: 'Disciplines', path: '/super-admin/disciplines' },
                      { label: 'Niveaux', path: '/super-admin/levels' },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 👤 Avatar + dropdown profil */}
            <div className="relative" ref={avatarDropdownRef}>
              <button
                onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-xs font-bold ${avatarText}`}>{userInitials}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-800 leading-tight">{userName}</p>
                  <p className={`text-xs font-medium text-${accentColor}-600 leading-tight`}>{roleLabel}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${avatarDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {avatarDropdownOpen && (
                <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[100]">
                  {/* Info utilisateur */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-sm font-bold ${avatarText}`}>{userInitials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions profil */}
                  {role !== 'super-admin' && (
                    <div className="py-1 border-b border-gray-100">
                      <button
                        onClick={() => navigateTo(`/${role}/profile`)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Modifier mes données
                      </button>
                    </div>
                  )}

                  {/* Déconnexion */}
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      role === 'teacher' 
                      ? 'text-emerald-700 hover:bg-emerald-50' 
                      : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── Contenu de la page ── */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

    </div>
  );
}
