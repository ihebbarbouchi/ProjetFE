'use client';

import { ProtectedRoute } from '../components/ProtectedRoute';

export default function AddResourceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['teacher']}>
            {children}
        </ProtectedRoute>
    );
}
