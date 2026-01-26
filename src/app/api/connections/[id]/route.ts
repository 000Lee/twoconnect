import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const connectionId = id

    // 쿠키에서 user_id (UUID) 가져오기
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 먼저 연결이 존재하고 삭제 권한이 있는지 확인
    const { data: connection, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (fetchError || !connection) {
      return NextResponse.json(
        { success: false, error: '연결을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인이 포함된 연결만 삭제 가능 (UUID로 비교)
    if (connection.user_id1 !== userId && connection.user_id2 !== userId) {
      return NextResponse.json(
        { success: false, error: '연결을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 연결 삭제
    const { error: deleteError } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)

    if (deleteError) {
      console.error('연결 삭제 오류:', deleteError)
      return NextResponse.json(
        { success: false, error: '연결 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('연결 삭제 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
