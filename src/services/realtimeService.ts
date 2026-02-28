import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Star } from '@/types/star';

export interface RealtimeCallbacks {
  onInsert: (star: Star) => void;
  onDelete: (star: Star) => void;
}

export function subscribeToStars(callbacks: RealtimeCallbacks): RealtimeChannel {
  const channel = supabase
    .channel('stars-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'stars' },
      (payload) => {
        callbacks.onInsert(payload.new as Star);
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'stars' },
      (payload) => {
        callbacks.onDelete(payload.old as Star);
      },
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromStars(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
