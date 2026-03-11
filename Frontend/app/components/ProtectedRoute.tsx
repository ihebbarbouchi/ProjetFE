'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Not logged in → redirect to login
                router.replace('/');
            } else if (user && (user.status === 'rejected')) {
                // Account rejected → logout and redirect
                logout();
                router.replace('/login');
            } else if (user && user.status === 'pending') {
                // Account pending → redirect to login to show message
                router.replace('/login');
            } else if (user && !allowedRoles.includes(user.role)) {
                // Logged in but wrong role → redirect to their own dashboard
                if (user.role === 'super-admin') {
                    router.replace('/super-admin');
                } else if (user.role === 'teacher') {
                    router.replace('/teacher');
                } else {
                    router.replace('/student');
                }
            }
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, router]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated or wrong role, don't render children (redirect will happen)
    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Redirecting...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
