import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, SupabaseClient } from '@/lib/supabase'
import { signJwt } from '@/lib/jwt'

export async function POST(request: NextRequest) {
   try {
      const { email, password } = await request.json()

      // 입력 검증
      if (!email || !password) {
         return NextResponse.json({ success: false, error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 })
      }

      // Supabase 클라이언트 생성
      const supabase = createServerSupabaseClient()

      // 로그인 함수 호출
      const { data, error } = await supabase.rpc('login_user', {
         email,
         password,
      })

      if (error) {
         console.error('Login error:', error)
         return NextResponse.json({ success: false, error: '로그인 중 오류가 발생했습니다.' }, { status: 500 })
      }

      if (data && data.success) {
         const response = NextResponse.json(data)

         // Access JWT (15m)
         const accessToken = signJwt({ sub: data.user_id, nickname: data.nickname, email: data.email, is_admin: !!data.is_admin }, process.env.JWT_SECRET || 'dev-secret', { expiresInSec: 60 * 15 })

         response.cookies.set('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
         })

         // Keep user_id for backward compatibility during transition
         response.cookies.set('user_id', data.user_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
         })

         return response
      } else {
         return NextResponse.json({ success: false, error: data?.error || '로그인에 실패했습니다.' }, { status: 401 })
      }
   } catch (error) {
      console.error('Login API error:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
