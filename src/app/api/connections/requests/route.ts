import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
   try {
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

      // 해당 사용자에게 온 pending 상태의 친구요청 조회 (user_id2는 수신자 UUID 문자열)
      const { data, error } = await supabase
         .from('connections')
         .select(
            `
        id,
        user_id1,
        user_id2,
        status,
        created_at
       `
         )
         .eq('user_id2', userId)
         .eq('status', 'pending')

      if (error) {
         console.error('친구요청 조회 오류:', error)
         return NextResponse.json({ success: false, error: '친구요청 조회 중 오류가 발생했습니다.' }, { status: 500 })
      }

      // user_id1에 저장된 상대방 UUID들을 닉네임으로 변환
      const userIds = data.map((request) => request.user_id1)
      const { data: users, error: usersError } = await supabase.from('users').select('id, nickname').in('id', userIds)

      if (usersError) {
         console.error('사용자 정보 조회 오류:', usersError)
         return NextResponse.json({ success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' }, { status: 500 })
      }

      // 사용자 ID를 닉네임으로 매핑
      const userMap = new Map(users?.map((user) => [user.id, user.nickname]) || [])

      const requestsWithNicknames = data.map((request) => ({
         id: request.id,
         from_nickname: userMap.get(request.user_id1) || '알 수 없는 사용자',
         created_at: request.created_at,
      }))

      return NextResponse.json({
         success: true,
         requests: requestsWithNicknames,
      })
   } catch (error) {
      console.error('친구요청 API 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
