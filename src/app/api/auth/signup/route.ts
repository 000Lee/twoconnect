import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, SupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname } = await request.json()

    // 입력 검증
    if (!email || !password || !nickname) {
      return NextResponse.json(
        { success: false, error: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient()

    // 회원가입 함수 호출
    const { data, error } = await supabase.rpc('signup_user', {
      email,
      password,
      nickname
    })

    if (error) {
      console.error('Signup error:', error)
      return NextResponse.json(
        { success: false, error: '회원가입 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (data && data.success) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { success: false, error: data?.error || '회원가입에 실패했습니다.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
