import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    
    // localStorage에서 사용자 정보 가져오기 (실제로는 JWT 토큰 사용 권장)
    const userNickname = request.headers.get('x-user-nickname') || 'anonymous'

    // Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient()

    // RLS를 위한 사용자 닉네임 설정
    await supabase.rpc('set_user_nickname', { p_nickname: userNickname })

    // 현재 책갈피 상태 확인
    const { data: currentBookmark } = await supabase
      .from('post_bookmarks')
      .select('*')
      .eq('post_id', postId)
      .eq('bookmarker_nickname', userNickname)
      .single()

    if (currentBookmark) {
      // 이미 책갈피된 경우 해제
      const { error } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('bookmarker_nickname', userNickname)

      if (error) {
        console.error('Post unbookmark error:', error)
        return NextResponse.json(
          { success: false, error: '게시글 책갈피 해제 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: '게시글 책갈피가 해제되었습니다.',
        action: 'unbookmarked'
      })
    } else {
      // 책갈피되지 않은 경우 설정
      const { error } = await supabase
        .from('post_bookmarks')
        .insert({
          post_id: postId,
          bookmarker_nickname: userNickname,
          bookmarked_at: new Date().toISOString()
        })

      if (error) {
        console.error('Post bookmark error:', error)
        return NextResponse.json(
          { success: false, error: '게시글 책갈피 설정 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: '게시글이 책갈피되었습니다.',
        action: 'bookmarked'
      })
    }
  } catch (error) {
    console.error('Post bookmark API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    const userNickname = request.headers.get('x-user-nickname') || 'anonymous'

    const supabase = createServerSupabaseClient()
    await supabase.rpc('set_user_nickname', { p_nickname: userNickname })

    // 게시글 책갈피 상태 조회
    const { data, error } = await supabase
      .from('post_bookmarks')
      .select('*')
      .eq('post_id', postId)
      .eq('bookmarker_nickname', userNickname)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없는 경우
      console.error('Post bookmark status fetch error:', error)
      return NextResponse.json(
        { success: false, error: '책갈피 상태 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      isBookmarked: !!data 
    })
  } catch (error) {
    console.error('Post bookmark status API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
