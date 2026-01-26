
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 서버 사이드에서 사용할 클라이언트 (서비스 롤 키 사용)
export const createServerSupabaseClient = () => {
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

   return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
         autoRefreshToken: false,
         persistSession: false,
      },
   })
}

// JWT 클레임을 설정하는 헬퍼 함수
export const setJwtClaims = async (supabase: any, userId: string, nickname?: string, isAdmin?: boolean) => {
   const claims = {
      sub: userId,
      nickname: nickname || '',
      is_admin: isAdmin || false,
   }

   // JWT 클레임을 PostgreSQL 세션 변수로 설정
   await supabase.rpc('set_jwt_claims', {
      claims: JSON.stringify(claims),
   })
}

// 타입 정의 추가
export type SupabaseClient = ReturnType<typeof createClient<Database>>
