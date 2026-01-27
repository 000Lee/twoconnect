import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

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
    // JWT에서 사용자 정보 추출
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('댓글 생성 API 호출됨, 사용자:', user.nickname)
    const body = await request.json()
    console.log('받은 요청 본문:', body)

    const { postId, content } = body

    // 입력 검증
    if (!postId || !content || !content.trim()) {
      console.log('입력 검증 실패:', { postId, content })
      return NextResponse.json(
        { success: false, error: '게시물 ID와 댓글 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    console.log('Supabase에 댓글 삽입 시도:', {
      post_id: postId,
      nickname: user.nickname,
      content: content.trim()
    })

    const supabase = createServerSupabaseClient()

    // 댓글 생성
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        nickname: user.nickname,
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
