'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/accounting');
  }, [router]);

  return null;
}