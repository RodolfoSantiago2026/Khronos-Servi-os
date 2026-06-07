"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { revalidatePath } from 'next/cache';

/**
 * Helper to verify if the request is from an authenticated administrator session.
 */
async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('khronos_admin_auth')?.value;
    if (!token) return false;
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'khronospro123';
    const payload = await verifyToken(token, adminPassword);
    return !!payload && payload.role === 'admin';
  } catch (err) {
    console.error('Error verifying admin session:', err);
    return false;
  }
}

/**
 * Fetches a single setting by key.
 */
export async function getSiteSettingsAction(key: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching site setting for key ${key}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data ? data.value : null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar as configurações.' };
  }
}

/**
 * Fetches all site settings.
 */
export async function getAllSiteSettingsAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('Error fetching all site settings:', error);
      return { success: false, error: error.message };
    }

    const settingsMap = (data || []).reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return { success: true, data: settingsMap };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar todas as configurações.' };
  }
}

/**
 * Saves or updates a setting by key.
 * Restrito a administradores autenticados.
 */
export async function saveSiteSettingsAction(key: string, value: any) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value });

    if (error) {
      console.error(`Error saving site setting for key ${key}:`, error);
      throw new Error(error.message);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar as configurações.' };
  }
}

/**
 * Uploads a site image to Supabase Storage bucket 'site-assets'.
 * Restrito a administradores autenticados.
 */
export async function uploadSiteImageAction(formData: FormData) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Nenhum arquivo enviado.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomStr}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('site-assets')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error uploading image to storage:', error);
      throw new Error(error.message);
    }

    // Gerar URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('site-assets')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao fazer o upload da imagem.' };
  }
}

/**
 * Fetches the admin master credentials email.
 * Restrito a administradores autenticados.
 */
export async function getAdminCredentialsAction() {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { data, error } = await supabaseAdmin
      .from('admin_auth')
      .select('email')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching admin credentials:', error);
      return { success: false, error: error.message };
    }

    return { success: true, email: data ? data.email : 'rodolfo@khronos.com.br' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao carregar as credenciais.' };
  }
}

/**
 * Updates the admin credentials (email and password).
 * Restrito a administradores autenticados com confirmação da senha atual.
 */
export async function updateAdminCredentialsAction(currentPassword: string, email: string, newPassword?: string) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    if (!email || email.trim() === '') {
      return { success: false, error: 'O e-mail mestre é obrigatório.' };
    }

    if (!currentPassword) {
      return { success: false, error: 'A senha atual é obrigatória para autorizar alterações.' };
    }

    // 1. Buscar as credenciais atuais na tabela admin_auth do Supabase
    const { data: currentAuth, error: fetchError } = await supabaseAdmin
      .from('admin_auth')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching admin credentials:', fetchError);
      return { success: false, error: 'Erro ao validar a credencial mestre no banco.' };
    }

    // 2. Validar a senha atual informada pelo usuário
    if (currentAuth) {
      if (currentAuth.password !== currentPassword) {
        return { success: false, error: 'A senha atual informada está incorreta.' };
      }
    } else {
      // Se não há registros na tabela, valida contra a senha padrão do .env.local
      const defaultPassword = process.env.ADMIN_PASSWORD || 'khronospro123';
      if (defaultPassword !== currentPassword) {
        return { success: false, error: 'A senha atual informada está incorreta.' };
      }
    }

    const updateData: any = { email: email.trim() };
    if (newPassword && newPassword.trim() !== '') {
      updateData.password = newPassword.trim();
    }

    // 3. Atualizar ou criar a credencial
    if (currentAuth && currentAuth.id) {
      const { error } = await supabaseAdmin
        .from('admin_auth')
        .update(updateData)
        .eq('id', currentAuth.id);

      if (error) {
        console.error('Error updating admin credentials:', error);
        return { success: false, error: 'Erro ao atualizar as credenciais no Supabase: ' + error.message };
      }
    } else {
      // Caso não exista nenhuma linha, inserimos uma nova (se informada uma nova senha)
      if (!updateData.password) {
        updateData.password = currentPassword; // Usa a senha padrão como inicial se não informada nova
      }
      const { error } = await supabaseAdmin
        .from('admin_auth')
        .insert([updateData]);

      if (error) {
        console.error('Error inserting admin credentials:', error);
        return { success: false, error: 'Erro ao criar as credenciais no Supabase: ' + error.message };
      }
    }

    // 4. Invalidar a sessão atual para forçar login com as novas credenciais
    const cookieStore = await cookies();
    cookieStore.delete('khronos_admin_auth');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar as credenciais.' };
  }
}

