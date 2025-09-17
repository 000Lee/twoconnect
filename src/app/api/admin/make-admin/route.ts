import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
   try {
      // 쿠키에서 user_id 가져오기
      const userId = request.cookies.get('user_id')?.value

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      const supabase = createServerSupabaseClient()

      // 현재 사용자가 admin인지 확인
      const { data: currentUser, error: userError } = await supabase.from('users').select('is_admin').eq('id', userId).single()

      if (userError || !currentUser?.is_admin) {
         return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
      }

      const { targetEmail } = await request.json()

      if (!targetEmail) {
         return NextResponse.json({ success: false, error: '이메일을 입력해주세요.' }, { status: 400 })
      }

      // 대상 사용자 찾기
      const { data: targetUser, error: findError } = await supabase.from('users').select('id, email, nickname, is_admin').eq('email', targetEmail).single()

      if (findError || !targetUser) {
         return NextResponse.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
      }

      if (targetUser.is_admin) {
         return NextResponse.json({ success: false, error: '이미 admin 권한을 가지고 있습니다.' }, { status: 400 })
      }

      // Admin 권한 부여
      const { error: updateError } = await supabase.from('users').update({ is_admin: true }).eq('id', targetUser.id)

      if (updateError) {
         console.error('Admin 권한 부여 오류:', updateError)
         return NextResponse.json({ success: false, error: 'Admin 권한 부여에 실패했습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
         message: `${targetUser.nickname}(${targetUser.email})에게 admin 권한을 부여했습니다.`,
      })
   } catch (error) {
      console.error('Admin 권한 부여 API 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
