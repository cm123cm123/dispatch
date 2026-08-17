import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TaskBoard from '@/components/TaskBoard'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <TaskBoard />
}
