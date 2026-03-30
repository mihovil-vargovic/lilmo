export type PoopType = 'poop' | 'pee' | 'poop_and_pee'

export interface FeedEntry {
  id: string
  room_code: string
  logged_at: string
  created_at: string
}

export interface PoopEntry {
  id: string
  room_code: string
  type: PoopType
  logged_at: string
  created_at: string
}
