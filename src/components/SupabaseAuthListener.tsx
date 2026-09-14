"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SupabaseAuthListener() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // Capture if the user arrived with an implicit flow token in the hash
  const [arrivedWithToken] = useState(() => 
    typeof window !== 'undefined' && window.location.hash.includes('access_token=')
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      // Check for hash errors (e.g. expired link)
      if (hash.includes('error=')) {
        const urlParams = new URLSearchParams(hash.replace('#', '?'));
        const errorDescription = urlParams.get('error_description');
        if (errorDescription?.includes('expired')) {
          toast.error("Invite link expired. Please ask your administrator to send a new one.");
        } else {
          toast.error(errorDescription || "Authentication error occurred");
        }
      }
      
      // Check for password recovery
      if (hash.includes('type=recovery')) {
        router.push('/reset-password');
        return; // Don't process normal auth listener logic
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect if they explicitly sign in, or if they just arrived via an invite link
      if ((event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && arrivedWithToken)) && session) {
        if (pathname === '/') {
          const role = session.user?.user_metadata?.role;
          if (role === 'city_staff') {
              router.push('/staff/login');
          } else if (role === 'super_admin') {
              router.push('/admin/login');
          } else {
              router.push('/app/login');
          }
        }
        
        if (event === 'SIGNED_IN') {
          router.refresh();
        }
      } else if (event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return null;
}
