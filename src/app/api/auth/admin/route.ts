import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
   try {
      // 쿠키에서 user_id 가져오기
      const userId = request.cookies.get('user_id')?.value

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      const supabase = createServerSupabaseClient()

      // 사용자 정보 조회 (admin 권한 포함)
      const { data: user, error } = await supabase.from('users').select('id, nickname, email, is_admin').eq('id', userId).single()

      if (error || !user) {
         return NextResponse.json({ success: false, error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
      }

      return NextResponse.json({
         success: true,
         isAdmin: user.is_admin || false,
      })
   } catch (error) {
      console.error('Admin 권한 확인 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
