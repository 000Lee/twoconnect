import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
   try {
      const requestId = params.id
      const supabase = createServerSupabaseClient()

      // 쿠키에서 user_id 가져오기
      const userId = request.cookies.get('user_id')?.value

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      // 현재 사용자의 닉네임 조회
      const { data: userData, error: userError } = await supabase.from('users').select('nickname').eq('id', userId).single()

      if (userError || !userData) {
         return NextResponse.json({ success: false, error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
      }

      // 친구요청이 존재하고 해당 사용자에게 온 것인지 확인 (user_id2는 수신자 UUID 문자열)
      const { data: connectionData, error: fetchError } = await supabase.from('connections').select('*').eq('id', requestId).eq('user_id2', userId).eq('status', 'pending').single()

      if (fetchError || !connectionData) {
         return NextResponse.json({ success: false, error: '유효하지 않은 친구요청입니다.' }, { status: 400 })
      }

      // 친구요청 상태를 rejected로 변경
      const { error: updateError } = await supabase.from('connections').update({ status: 'rejected' }).eq('id', requestId)

      if (updateError) {
         console.error('친구요청 거절 오류:', updateError)
         return NextResponse.json({ success: false, error: '친구요청 거절 중 오류가 발생했습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
         message: '친구요청을 거절했습니다.',
      })
   } catch (error) {
      console.error('친구요청 거절 API 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
