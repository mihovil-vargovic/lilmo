export type PoopType = 'poop' | 'pee' | 'poop_and_pee'

export interface FeedEntry {
  id: string
  room_code: string
  logged_at: string
  created_at: string
  feed_type?: 'bottle' | 'boobies'
  duration_minutes?: number
}

export interface PoopEntry {
  id: string
  room_code: string
  type: PoopType
  logged_at: string
  created_at: string
}
