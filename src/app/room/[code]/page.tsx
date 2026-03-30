import { redirect } from 'next/navigation'

interface RoomPageProps {
  params: { code: string }
}

export default function RoomPage({ params }: RoomPageProps) {
  redirect(`/room/${params.code}/feed`)
}
