import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { content, imageFile, selectedFriendId } = await request.json()

    // 입력 검증
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    // localStorage에서 사용자 정보 가져오기 (실제로는 JWT 토큰 사용 권장)
    const userNickname = request.headers.get('x-user-nickname') || '익명'
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient()

    // RLS를 위한 사용자 닉네임 설정
    await supabase.rpc('set_user_nickname', { p_nickname: userNickname })

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
        // 이미지 업로드 실패 시에도 포스트는 생성
        imageUrl = null
      }
    } else {
      console.log('이미지 파일 없음 또는 데이터 없음')
    }

    // 포스트 생성 함수 호출
    const { data, error } = await supabase.rpc('create_post', {
      p_user_id: userId,
      p_nickname: userNickname,
      p_content: content.trim(),
      p_image_url: imageUrl,
      p_friend_id: selectedFriendId || null
    })

    if (error) {
      console.error('Post creation error:', error)
      return NextResponse.json(
        { success: false, error: '포스트 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (data && data.success) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { success: false, error: data?.error || '포스트 생성에 실패했습니다.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Post API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const friendId = searchParams.get('friendId')

    const supabase = createServerSupabaseClient()

    // RLS를 위한 사용자 닉네임 설정
    if (userId) {
      await supabase.rpc('set_user_nickname', { p_nickname: userId })
    }

    let posts
    let error

    if (friendId) {
      // 친구를 선택한 경우: 해당 친구와 본인의 게시글만 가져오기
      const { data, error: friendError } = await supabase.rpc('get_connected_posts', {
        p_user_id: userId,
        p_friend_id: friendId
      })
      posts = data
      error = friendError
    } else if (userId) {
      // 본인의 게시글만 가져오기
      const { data, error: userError } = await supabase.rpc('get_user_posts', {
        p_user_id: userId
      })
      posts = data
      error = userError
    } else {
      // 파라미터가 없는 경우 빈 배열 반환
      return NextResponse.json({ success: true, posts: [] })
    }

    if (error) {
      console.error('Posts fetch error:', error)
      return NextResponse.json(
        { success: false, error: '포스트 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, posts: posts || [] })
  } catch (error) {
    console.error('Posts API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
