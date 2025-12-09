import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
   try {
      const { friendNickname } = await request.json()

      if (!friendNickname || !friendNickname.trim()) {
         return NextResponse.json({ success: false, error: '친구 닉네임을 입력해주세요.' }, { status: 400 })
      }

      const supabase = createServerSupabaseClient()

      // 쿠키에서 user_id 가져오기
      const userId = request.cookies.get('user_id')?.value

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      // 사용자 정보 조회
      const { data: userData, error: userError } = await supabase.from('users').select('id, nickname').eq('id', userId).single()

      if (userError || !userData) {
         return NextResponse.json({ success: false, error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
      }

      console.log('친구 연결 요청:', { userId: userData.id, friendNickname })

      // 친구 닉네임으로 사용자 ID 조회
      const { data: friendData, error: friendError } = await supabase
         .from('users')
         .select('id, nickname')
         .eq('nickname', friendNickname.trim())
         .single()

      if (friendError || !friendData) {
         console.error('친구 사용자 조회 오류:', friendError)
         return NextResponse.json({ success: false, error: '해당 닉네임의 사용자를 찾을 수 없습니다.' }, { status: 404 })
      }

      // 자기 자신에게 친구 요청을 보낼 수 없도록 체크
      if (friendData.id === userData.id) {
         return NextResponse.json({ success: false, error: '자기 자신에게는 친구 요청을 보낼 수 없습니다.' }, { status: 400 })
      }

      // 친구 연결 요청 함수 호출
      const { data, error } = await supabase.rpc('request_connection', {
         p_user_id1: userData.id,
         p_user_id2: friendData.id,
      })

      if (error) {
         console.error('Connection request error:', error)
         return NextResponse.json({ success: false, error: '친구 연결 요청 중 오류가 발생했습니다.' }, { status: 500 })
      }

      if (data && data.success) {
         console.log('친구 연결 요청 성공:', data.message)
         return NextResponse.json(data)
      } else {
         console.error('친구 연결 요청 실패:', data?.error)
         return NextResponse.json({ success: false, error: data?.error || '친구 연결 요청에 실패했습니다.' }, { status: 400 })
      }
   } catch (error) {
      console.error('Connection API error:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}

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

      console.log('친구 연결 목록 조회:', { userId, nickname: userData.nickname })

      // 사용자의 연결된 친구 목록 조회 함수 호출
      const { data, error } = await supabase.rpc('get_user_connections', {
         p_user_id: userId, // 사용자 ID로 조회
      })

      if (error) {
         console.error('Connections fetch error:', error)
         return NextResponse.json({ success: false, error: '친구 연결 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
      }

      console.log('조회된 친구 연결들:', data)
      console.log('조회된 친구 연결 개수:', data?.length || 0)

      // 각 연결의 friend_id와 friend_nickname 확인
      if (data && data.length > 0) {
         data.forEach((conn: any, index: number) => {
            console.log(`연결 ${index + 1}:`, {
               friend_id: conn.friend_id,
               friend_nickname: conn.friend_nickname,
               connection_status: conn.connection_status,
            })
         })
      }

      return NextResponse.json({ success: true, connections: data })
   } catch (error) {
      console.error('Connections API error:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
