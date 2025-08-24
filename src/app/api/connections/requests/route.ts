import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 해당 사용자에게 온 pending 상태의 친구요청 조회
    const { data, error } = await supabase
      .from('connections')
      .select(`
        id,
        user_id1,
        user_id2,
        status,
        created_at
      `)
      .eq('user_id2', userId)  // user_id2는 이제 닉네임
      .eq('status', 'pending')

    if (error) {
      console.error('친구요청 조회 오류:', error)
      return NextResponse.json(
        { success: false, error: '친구요청 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 요청을 보낸 사용자의 닉네임은 user_id1에 이미 저장되어 있음
    const requestsWithNicknames = data.map((request) => ({
      id: request.id,
      from_nickname: request.user_id1,  // user_id1은 보내는 사람의 닉네임
      created_at: request.created_at
    }))

    return NextResponse.json({ 
      success: true, 
      requests: requestsWithNicknames 
    })
  } catch (error) {
    console.error('친구요청 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
