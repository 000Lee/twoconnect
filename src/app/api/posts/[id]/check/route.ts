import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id)
    
    // localStorage에서 사용자 정보 가져오기 (실제로는 JWT 토큰 사용 권장)
    const userNickname = request.headers.get('x-user-nickname') || 'anonymous'

    // Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient()

    // RLS를 위한 사용자 닉네임 설정
    await supabase.rpc('set_user_nickname', { p_nickname: userNickname })

    // 현재 체크 상태 확인
    const { data: currentCheck } = await supabase
      .from('post_checks')
      .select('*')
      .eq('post_id', postId)
      .eq('checker_nickname', userNickname)
      .single()

    if (currentCheck) {
      // 이미 체크된 경우 체크 해제
      const { error } = await supabase
        .from('post_checks')
        .delete()
        .eq('post_id', postId)
        .eq('checker_nickname', userNickname)

      if (error) {
        console.error('Post uncheck error:', error)
        return NextResponse.json(
          { success: false, error: '게시글 체크 해제 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: '게시글 체크가 해제되었습니다.',
        action: 'unchecked'
      })
    } else {
      // 체크되지 않은 경우 체크
      const { error } = await supabase
        .from('post_checks')
        .insert({
          post_id: postId,
          checker_nickname: userNickname,
          checked_at: new Date().toISOString()
        })

      if (error) {
        console.error('Post check error:', error)
        return NextResponse.json(
          { success: false, error: '게시글 체크 처리 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: '게시글이 체크되었습니다.',
        action: 'checked'
      })
    }
  } catch (error) {
    console.error('Post check API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id)
    const userNickname = request.headers.get('x-user-nickname') || 'anonymous'

    const supabase = createServerSupabaseClient()
    await supabase.rpc('set_user_nickname', { p_nickname: userNickname })

    // 게시글 체크 상태 조회
    const { data, error } = await supabase
      .from('post_checks')
      .select('*')
      .eq('post_id', postId)
      .eq('checker_nickname', userNickname)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없는 경우
      console.error('Post check status fetch error:', error)
      return NextResponse.json(
        { success: false, error: '체크 상태 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      isChecked: !!data 
    })
  } catch (error) {
    console.error('Post check status API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
