import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, setJwtClaims } from '@/lib/supabase'
import { verifyJwt } from '@/lib/jwt'

export async function GET(request: NextRequest) {
   try {
      const supabase = createServerSupabaseClient()

      // 공지사항 조회 (최신순)
      const { data: notices, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false })

      if (error) {
         console.error('공지사항 조회 오류:', error)
         return NextResponse.json({ success: false, error: '공지사항을 불러올 수 없습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
         notices: notices || [],
      })
   } catch (error) {
      console.error('공지사항 API 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}

export async function POST(request: NextRequest) {
   try {
      const supabase = createServerSupabaseClient()

      // JWT 토큰 인증 확인
      const accessToken = request.cookies.get('access_token')?.value
      let userId: string | null = null

      if (accessToken) {
         const verified = verifyJwt(accessToken, process.env.JWT_SECRET || 'dev-secret')
         if (verified.valid && verified.payload?.sub) {
            userId = String(verified.payload.sub)
         }
      }

      // 호환을 위해 user_id 쿠키도 허용
      if (!userId) {
         userId = request.cookies.get('user_id')?.value || null
      }

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      // Admin 권한 확인
      const { data: userData, error: userError } = await supabase.from('users').select('is_admin, nickname').eq('id', userId).single()

      if (userError || !userData?.is_admin) {
         return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
      }

      // JWT 클레임 설정 (RLS 정책을 위해)
      await setJwtClaims(supabase, userId, userData.nickname, true)

      const { title, content, is_important } = await request.json()

      if (!title || !content) {
         return NextResponse.json({ success: false, error: '제목과 내용을 입력해주세요.' }, { status: 400 })
      }

      // 공지사항 생성
      const { data: notice, error } = await supabase
         .from('notices')
         .insert({
            title,
            content,
            is_important: is_important || false,
            created_by: userId,
         })
         .select()
         .single()

      if (error) {
         console.error('공지사항 생성 오류:', error)
         return NextResponse.json({ success: false, error: '공지사항을 생성할 수 없습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
         notice,
      })
   } catch (error) {
      console.error('공지사항 생성 API 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}

export async function PUT(request: NextRequest) {
   try {
      const supabase = createServerSupabaseClient()

      // JWT 토큰 인증 확인
      const accessToken = request.cookies.get('access_token')?.value
      let userId: string | null = null

      if (accessToken) {
         const verified = verifyJwt(accessToken, process.env.JWT_SECRET || 'dev-secret')
         if (verified.valid && verified.payload?.sub) {
            userId = String(verified.payload.sub)
         }
      }

      // 호환을 위해 user_id 쿠키도 허용
      if (!userId) {
         userId = request.cookies.get('user_id')?.value || null
      }

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      // Admin 권한 확인
      const { data: userData, error: userError } = await supabase.from('users').select('is_admin, nickname').eq('id', userId).single()

      if (userError || !userData?.is_admin) {
         return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
      }

      // JWT 클레임 설정 (RLS 정책을 위해)
      await setJwtClaims(supabase, userId, userData.nickname, true)

      const { id, title, content, is_important } = await request.json()

      if (!id || !title || !content) {
         return NextResponse.json({ success: false, error: '필수 정보가 누락되었습니다.' }, { status: 400 })
      }

      // 공지사항 수정
      const { data: notice, error } = await supabase
         .from('notices')
         .update({
            title,
            content,
            is_important: is_important || false,
         })
         .eq('id', id)
         .select()
         .single()

      if (error) {
         console.error('공지사항 수정 오류:', error)
         return NextResponse.json({ success: false, error: '공지사항을 수정할 수 없습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
         notice,
      })
   } catch (error) {
      console.error('공지사항 수정 API 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}

export async function DELETE(request: NextRequest) {
   try {
      const supabase = createServerSupabaseClient()

      // JWT 토큰 인증 확인
      const accessToken = request.cookies.get('access_token')?.value
      let userId: string | null = null

      if (accessToken) {
         const verified = verifyJwt(accessToken, process.env.JWT_SECRET || 'dev-secret')
         if (verified.valid && verified.payload?.sub) {
            userId = String(verified.payload.sub)
         }
      }

      // 호환을 위해 user_id 쿠키도 허용
      if (!userId) {
         userId = request.cookies.get('user_id')?.value || null
      }

      if (!userId) {
         return NextResponse.json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 })
      }

      // Admin 권한 확인
      const { data: userData, error: userError } = await supabase.from('users').select('is_admin, nickname').eq('id', userId).single()

      if (userError || !userData?.is_admin) {
         return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
      }

      // JWT 클레임 설정 (RLS 정책을 위해)
      await setJwtClaims(supabase, userId, userData.nickname, true)

      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
         return NextResponse.json({ success: false, error: '공지사항 ID가 필요합니다.' }, { status: 400 })
      }

      // 공지사항 삭제
      const { error } = await supabase.from('notices').delete().eq('id', id)

      if (error) {
         console.error('공지사항 삭제 오류:', error)
         return NextResponse.json({ success: false, error: '공지사항을 삭제할 수 없습니다.' }, { status: 500 })
      }

      return NextResponse.json({
         success: true,
      })
   } catch (error) {
      console.error('공지사항 삭제 API 오류:', error)
      return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
   }
}
