import { supabase } from './supabase';
import type { Star, StarInsert } from '@/types/star';
import { MAX_STARS } from '@/utils/constants';

export async function fetchStars(): Promise<Star[]> {
  const { data, error } = await supabase
    .from('stars')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(MAX_STARS);

  if (error) throw error;
  return data as Star[];
}

export async function insertStar(star: StarInsert): Promise<Star> {
  const { data, error } = await supabase
    .from('stars')
    .insert(star)
    .select()
    .single();

  if (error) throw error;
  return data as Star;
}
