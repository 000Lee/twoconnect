import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 친구요청이 존재하고 해당 사용자에게 온 것인지 확인
    const { data: connectionData, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', requestId)
      .eq('user_id2', userId)  // user_id2는 이제 닉네임
      .eq('status', 'pending')
      .single()

    if (fetchError || !connectionData) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 친구요청입니다.' },
        { status: 400 }
      )
    }

    // 친구요청 상태를 accepted로 변경
    const { error: updateError } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (updateError) {
      console.error('친구요청 수락 오류:', updateError)
      return NextResponse.json(
        { success: false, error: '친구요청 수락 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: '친구요청을 수락했습니다.' 
    })
  } catch (error) {
    console.error('친구요청 수락 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
