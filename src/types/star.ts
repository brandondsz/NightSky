export interface Point {
  x: number;
  y: number;
}

export interface Star {
  id: string;
  path_data: Point[];
  color: string;
  stroke_width: number;
  session_id: string;
  created_at: string;
}

export type StarInsert = Pick<Star, 'path_data' | 'color' | 'stroke_width' | 'session_id'>;
