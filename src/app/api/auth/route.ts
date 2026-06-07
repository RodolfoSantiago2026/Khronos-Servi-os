import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateToken } from '@/lib/auth-token';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'khronospro123';

    let success = false;

    if (email) {
      // Verificar credenciais na tabela admin_auth do Supabase
      const { data, error } = await supabaseAdmin
        .from('admin_auth')
        .select('*')
        .eq('email', email.trim())
        .eq('password', password)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        success = true;
      }
    } else {
      // Login fallback com apenas senha do .env.local
      if (password === adminPassword) {
        success = true;
      }
    }

    if (success) {
      const payload = {
        role: 'admin',
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 dias
      };

      const token = await generateToken(payload, adminPassword);
      const cookieStore = await cookies();
      
      cookieStore.set('khronos_admin_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 semana
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: email ? 'E-mail ou senha incorretos' : 'Senha incorreta' }, { status: 401 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}


export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('khronos_admin_auth');
  return NextResponse.json({ success: true });
}
