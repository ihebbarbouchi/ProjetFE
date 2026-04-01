'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { BookOpen, Menu, X } from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Accueil', path: '/' },
    { label: 'À propos', path: '/about' },
    { label: 'Categories', path: '/public-resources' },
    { label: 'Formations', path: '/formations' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation principale */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduShare</span>
            </Link>

            {/* Menu de navigation - Bureau */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Boutons d'authentification - Bureau */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => handleNavigation('/login')}
              >
                Se connecter
              </Button>
              <Button
                onClick={() => handleNavigation('/signup')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                S&apos;inscrire
              </Button>
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Navigation mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/login')}
                  className="w-full"
                >
                  Se connecter
                </Button>
                <Button
                  onClick={() => handleNavigation('/signup')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  S&apos;inscrire
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1">{children}</main>

      {/* Pied de page */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Marque */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EduShare</span>
              </div>
              <p className="text-sm text-gray-600">
                Autonomiser l&apos;éducation grâce au partage collaboratif de ressources
              </p>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors block"
                  >
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors block"
                  >
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors block"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Plateforme */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Plateforme</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors block"
                  >
                    Se connecter
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors block"
                  >
                    S&apos;inscrire
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-gray-600">Pour les enseignants</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600">Pour les étudiants</span>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-gray-600">Centre d&apos;aide</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600">Documentation</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600">Politique de confidentialité</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600">Conditions d&apos;utilisation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Barre inférieure */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-gray-600">
                © 2026 EduShare. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-sm text-gray-600">Français</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}