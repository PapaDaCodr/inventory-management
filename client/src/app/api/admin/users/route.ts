import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, full_name, role, employee_id, contact_phone, department } = body || {}

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1) Create auth user (email confirmed) with a forced password reset on first login
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { must_reset_password: true },
    })
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2) Create profile row
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role,
        employee_id: employee_id || null,
        contact_phone: contact_phone || null,
        department: department || null,
        is_active: true,
      })
      .select()
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json(profile, { status: 200 })
  } catch (err: any) {
    console.error('Admin user creation error:', err)
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}

