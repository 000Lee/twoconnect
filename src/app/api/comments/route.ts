import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { success: false, error: '게시물 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 해당 게시물의 댓글 조회
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('댓글 조회 오류:', error)
      return NextResponse.json(
        { success: false, error: '댓글 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, comments: comments || [] })
  } catch (error) {
    console.error('댓글 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('댓글 생성 API 호출됨')
    const body = await request.json()
    console.log('받은 요청 본문:', body)
    
    const { postId, content } = body
    const rawNickname = request.headers.get('x-user-nickname')
    const userNickname = rawNickname ? decodeURIComponent(rawNickname) : null
    console.log('헤더에서 가져온 닉네임:', userNickname)

    // 입력 검증
    if (!postId || !content || !content.trim()) {
      console.log('입력 검증 실패:', { postId, content })
      return NextResponse.json(
        { success: false, error: '게시물 ID와 댓글 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!userNickname) {
      console.log('사용자 닉네임 없음')
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('Supabase에 댓글 삽입 시도:', {
      post_id: postId,
      nickname: userNickname,
      content: content.trim()
    })

    const supabase = createServerSupabaseClient()

    // 댓글 생성
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        nickname: userNickname,
        content: content.trim()
      })
      .select()

    if (error) {
      console.error('Supabase 댓글 생성 오류:', error)
      return NextResponse.json(
        { success: false, error: '댓글 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log('댓글 생성 성공:', data[0])
    return NextResponse.json({ success: true, comment: data[0] })
  } catch (error) {
    console.error('댓글 생성 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
