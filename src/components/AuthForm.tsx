'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'

export default function AuthForm() {
  const supabase = createClient()

  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center text-gray-900">Todo List</h1>
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                theme="dark"
                showLinks={false}
                providers={['google']}
                redirectTo="http://localhost:3000/auth/callback"
            />
        </div>
    </div>
  )
}
