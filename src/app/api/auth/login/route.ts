import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, SupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient()

    // 로그인 함수 호출
    const { data, error } = await supabase.rpc('login_user', {
      email,
      password
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { success: false, error: '로그인 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (data && data.success) {
      // 로그인 성공 시 세션 쿠키 설정 (실제로는 JWT 토큰 사용 권장)
      const response = NextResponse.json(data)
      
      // 간단한 세션 쿠키 설정 (실제 프로덕션에서는 더 안전한 방법 사용)
      response.cookies.set('user_id', data.user_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7일
      })
      
      return response
    } else {
      return NextResponse.json(
        { success: false, error: data?.error || '로그인에 실패했습니다.' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
