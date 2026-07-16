import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import FreeHome from '@/components/FreeHome'

export default async function HomePage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return <FreeHome />
}