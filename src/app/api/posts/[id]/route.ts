import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT에서 사용자 정보 추출
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params
    const postId = parseInt(id)
    const { content, imageFile } = await request.json()

    // 입력 검증
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    const userId = user.id

    // Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient()

    // 이미지 파일이 있으면 처리
    let imageUrl = null
    if (imageFile && imageFile.data) {
      try {
        console.log('이미지 파일 정보:', {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
          dataLength: imageFile.data.length
        })
        
        // Base64 이미지 데이터를 Supabase Storage에 업로드
        const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
        
        // 실제로는 Supabase Storage에 업로드해야 하지만, 
        // 현재는 Base64 데이터를 직접 사용하여 테스트
        imageUrl = imageFile.data
        
        console.log('이미지 파일 처리됨:', fileName)
        console.log('이미지 URL 설정됨:', imageUrl.substring(0, 100) + '...')
      } catch (error) {
        console.error('이미지 업로드 오류:', error)
        // 이미지 업로드 실패 시에도 포스트는 수정
        imageUrl = null
      }
    } else {
      console.log('이미지 파일 없음 또는 데이터 없음')
    }

    // 포스트 수정 함수 호출
    const { data, error } = await supabase.rpc('update_post', {
      p_post_id: postId,
      p_user_id: userId,
      p_content: content.trim(),
      p_image_url: imageUrl
    })

    if (error) {
      console.error('Post update error:', error)
      return NextResponse.json(
        { success: false, error: '포스트 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (data && data.success) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { success: false, error: data?.error || '포스트 수정에 실패했습니다.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Post update API error:', error)
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
    // JWT에서 사용자 정보 추출
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params
    const postId = parseInt(id)
    const userId = user.id

    console.log('포스트 삭제 요청:', { postId, userId })

    const supabase = createServerSupabaseClient()

    // 포스트 삭제 함수 호출
    const { data, error } = await supabase.rpc('delete_post', {
      p_post_id: postId,
      p_user_id: userId
    })

    if (error) {
      console.error('Post deletion error:', error)
      return NextResponse.json(
        { success: false, error: '포스트 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (data && data.success) {
      console.log('포스트 삭제 성공:', data.message)
      return NextResponse.json(data)
    } else {
      console.error('포스트 삭제 실패:', data?.error)
      return NextResponse.json(
        { success: false, error: data?.error || '포스트 삭제에 실패했습니다.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Post deletion API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
