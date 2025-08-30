import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
   try {
      const postId = parseInt(params.id)

      // localStorage에서 사용자 정보 가져오기 (실제로는 JWT 토큰 사용 권장)
      const userNickname = request.headers.get('x-user-nickname') || 'anonymous'

      // Supabase 클라이언트 생성
      const supabase = createServerSupabaseClient()

      // RLS를 위한 사용자 닉네임 설정
      await supabase.rpc('set_user_nickname', { p_nickname: userNickname })

      // 현재 체크 상태 확인
      const { data: currentPost } = await supabase.from('posts').select('is_read').eq('id', postId).single()

      if (!currentPost) {
         return NextResponse.json({ success: false, error: '게시물을 찾을 수 없습니다.' }, { status: 404 })
      }

      // 체크 상태 토글
      const newCheckState = !currentPost.is_read
      const { error: updateError } = await supabase.from('posts').update({ is_read: newCheckState }).eq('id', postId)

      if (updateError) {
         console.error('Post check update error:', updateError)
         return NextResponse.json({ success: false, error: '체크 상태 변경 중 오류가 발생했습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
         message: newCheckState ? '게시글이 체크되었습니다.' : '게시글 체크가 해제되었습니다.',
         action: newCheckState ? 'checked' : 'unchecked',
      })
   } catch (error) {
      console.error('Post check API error:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
   try {
      const postId = parseInt(params.id)
      const userNickname = request.headers.get('x-user-nickname') || 'anonymous'

      const supabase = createServerSupabaseClient()
      await supabase.rpc('set_user_nickname', { p_nickname: userNickname })

      // 게시글 체크 상태 조회
      const { data, error } = await supabase.from('posts').select('is_read').eq('id', postId).single()

      if (error) {
         console.error('Post check status fetch error:', error)
         return NextResponse.json({ success: false, error: '체크 상태 조회 중 오류가 발생했습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
         isChecked: !!data?.is_read,
      })
   } catch (error) {
      console.error('Post check status API error:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
