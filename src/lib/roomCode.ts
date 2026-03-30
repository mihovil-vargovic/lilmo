import { supabase } from './supabase'

export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createRoom(code: string): Promise<void> {
  const { error } = await supabase.from('rooms').insert({ code })
  if (error) throw error
}

export async function roomExists(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('rooms')
    .select('code')
    .eq('code', code)
    .single()
  if (error) return false
  return !!data
}
