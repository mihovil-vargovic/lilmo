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

// Device ID — persisted in both localStorage and cookie so iOS Safari clears don't lose it
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem('lilmo_device_id')
  if (deviceId) return deviceId

  const cookieMatch = document.cookie.match(/lilmo_device_id=([^;]+)/)
  if (cookieMatch) {
    deviceId = cookieMatch[1]
    localStorage.setItem('lilmo_device_id', deviceId)
    return deviceId
  }

  deviceId = crypto.randomUUID()
  localStorage.setItem('lilmo_device_id', deviceId)
  document.cookie = `lilmo_device_id=${deviceId}; path=/; max-age=31536000`
  return deviceId
}

export async function canDeviceJoin(
  roomCode: string,
  deviceId: string
): Promise<{ allowed: boolean; isNew: boolean }> {
  const { data, error } = await supabase
    .from('room_devices')
    .select('device_id')
    .eq('room_code', roomCode)

  if (error) return { allowed: true, isNew: false } // fail open on error

  const devices = data || []
  const isRegistered = devices.some((d) => d.device_id === deviceId)

  if (isRegistered) return { allowed: true, isNew: false }
  if (devices.length < 4) return { allowed: true, isNew: true }
  return { allowed: false, isNew: false }
}

export function isAppleDevice(ua: string): boolean {
  return /iPhone|iPad|Macintosh/.test(ua)
}

export function parseDeviceLabel(ua: string): string {
  const isIPhone = /iPhone/.test(ua)
  const isIPad = /iPad/.test(ua)
  const isMac = /Macintosh/.test(ua)

  if (isIPhone || isIPad) {
    const iosMatch = ua.match(/OS (\d+)[_\d]* like/)
    const version = iosMatch ? iosMatch[1] : null
    const device = isIPad ? 'iPad' : 'iPhone'
    return version ? `${device} · iOS ${version}` : device
  }

  if (isMac) {
    const macMatch = ua.match(/Mac OS X (\d+)[_.](\d+)/)
    const version = macMatch ? `${macMatch[1]}.${macMatch[2]}` : null
    return version ? `MacBook · macOS ${version}` : 'MacBook'
  }

  return 'Unknown device'
}

export async function registerDevice(roomCode: string, deviceId: string): Promise<void> {
  const { error } = await supabase
    .from('room_devices')
    .insert({ room_code: roomCode, device_id: deviceId, user_agent: navigator.userAgent })
  if (error && error.code !== '23505') throw error // ignore duplicate inserts
}

export async function resetRoomDevices(roomCode: string): Promise<void> {
  const { error } = await supabase
    .from('room_devices')
    .delete()
    .eq('room_code', roomCode)
  if (error) throw error
}
