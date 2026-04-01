'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * /formations-details?id=X  →  redirects to  /formations/X
 * /formations-details (no id)  →  redirects to  /formations
 */
function FormationsDetailsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      router.replace(`/formations/${id}`);
    } else {
      router.replace('/formations');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        <p className="text-sm text-gray-500">Redirection en cours…</p>
      </div>
    </div>
  );
}

export default function FormationsDetailsRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <FormationsDetailsRedirectContent />
    </Suspense>
  );
}
