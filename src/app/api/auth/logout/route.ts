import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
   try {
      const response = NextResponse.json({ success: true })

      // 쿠키 삭제
      response.cookies.set('user_id', '', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 0, // 즉시 만료
         path: '/',
      })

      // access_token도 제거
      response.cookies.set('access_token', '', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 0,
         path: '/',
      })

      return response
   } catch (error) {
      console.error('로그아웃 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
