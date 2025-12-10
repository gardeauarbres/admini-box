'use client';

import { useRealtime } from '@/lib/hooks/useRealtime';
import { useAuth } from '@/context/AuthContext';

export default function RealtimeManager() {
    const { user } = useAuth();
    useRealtime(user ? user.$id : null);
    return null;
}
