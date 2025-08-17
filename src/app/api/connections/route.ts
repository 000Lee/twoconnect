import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { friendNickname } = await request.json()
    const userId = request.headers.get('x-user-id') || 'anonymous'

    if (!friendNickname || !friendNickname.trim()) {
      return NextResponse.json(
        { success: false, error: '친구 닉네임을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (userId === 'anonymous') {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('친구 연결 요청:', { userId, friendNickname })

    const supabase = createServerSupabaseClient()

    // 친구 연결 요청 함수 호출
    const { data, error } = await supabase.rpc('request_connection', {
      p_user_id1: userId,
      p_user_id2: friendNickname
    })

    if (error) {
      console.error('Connection request error:', error)
      return NextResponse.json(
        { success: false, error: '친구 연결 요청 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (data && data.success) {
      console.log('친구 연결 요청 성공:', data.message)
      return NextResponse.json(data)
    } else {
      console.error('친구 연결 요청 실패:', data?.error)
      return NextResponse.json(
        { success: false, error: data?.error || '친구 연결 요청에 실패했습니다.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Connection API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'anonymous'

    if (userId === 'anonymous') {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('친구 연결 목록 조회:', { userId })

    const supabase = createServerSupabaseClient()

    // 사용자의 연결된 친구 목록 조회 함수 호출
    const { data, error } = await supabase.rpc('get_user_connections', {
      p_user_id: userId
    })

    if (error) {
      console.error('Connections fetch error:', error)
      return NextResponse.json(
        { success: false, error: '친구 연결 목록 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log('조회된 친구 연결들:', data)
    return NextResponse.json({ success: true, connections: data })
  } catch (error) {
    console.error('Connections API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
