import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { verifyJwt } from '@/lib/jwt'

export async function GET(request: NextRequest) {
   try {
      // 1) access_token(JWT) 우선 검증
      const accessToken = request.cookies.get('access_token')?.value
      let userId: string | null = null

      if (accessToken) {
         const verified = verifyJwt(accessToken, process.env.JWT_SECRET || 'dev-secret')
         if (verified.valid && verified.payload?.sub) {
            userId = String(verified.payload.sub)
         }
      }

      // 2) 호환을 위해 user_id 쿠키도 허용
      if (!userId) {
         userId = request.cookies.get('user_id')?.value || null
      }

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      const supabase = createServerSupabaseClient()

      // 사용자 정보 조회
      const { data: user, error } = await supabase.from('users').select('id, nickname, email').eq('id', userId).single()

      if (error || !user) {
         return NextResponse.json({ success: false, error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
      }

      return NextResponse.json({
         success: true,
         user: {
            id: user.id,
            nickname: user.nickname,
            email: user.email,
         },
      })
   } catch (error) {
      console.error('사용자 정보 조회 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
