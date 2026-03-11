import type { Metadata } from 'next';
import './globals.css';
import { AuthProviderWrapper } from './components/AuthProviderWrapper';

export const metadata: Metadata = {
    title: 'EduShare - Collaborative Educational Resource Platform',
    description:
        'EduShare is your collaborative platform for sharing and accessing quality educational resources. Join thousands of teachers and students.',
};

import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProviderWrapper>{children}</AuthProviderWrapper>
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
