import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const commentId = id
    const { content } = await request.json()
    const userNickname = request.headers.get('x-user-nickname')

    if (!userNickname) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 먼저 댓글이 존재하고 수정 권한이 있는지 확인
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { success: false, error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인이 작성한 댓글만 수정 가능
    if (comment.nickname !== userNickname) {
      return NextResponse.json(
        { success: false, error: '댓글을 수정할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 댓글 수정
    const { data, error: updateError } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .select()

    if (updateError) {
      console.error('댓글 수정 오류:', updateError)
      return NextResponse.json(
        { success: false, error: '댓글 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, comment: data[0] })
  } catch (error) {
    console.error('댓글 수정 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const commentId = id
    const userNickname = request.headers.get('x-user-nickname')

    if (!userNickname) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 먼저 댓글이 존재하고 삭제 권한이 있는지 확인
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { success: false, error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인이 작성한 댓글만 삭제 가능
    if (comment.nickname !== userNickname) {
      return NextResponse.json(
        { success: false, error: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error('댓글 삭제 오류:', deleteError)
      return NextResponse.json(
        { success: false, error: '댓글 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('댓글 삭제 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
