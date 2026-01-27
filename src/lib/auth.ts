import { NextRequest } from 'next/server'
import { verifyJwt } from './jwt'

export interface AuthUser {
   id: string
   nickname: string
   email?: string
   isAdmin?: boolean
}

/**
 * JWT 쿠키에서 사용자 정보를 추출합니다.
 * @returns 인증된 사용자 정보 또는 null
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
   // 1) access_token(JWT) 우선 검증
   const accessToken = request.cookies.get('access_token')?.value

   if (accessToken) {
      const verified = verifyJwt(accessToken, process.env.JWT_SECRET || 'dev-secret')
      if (verified.valid && verified.payload?.sub && verified.payload?.nickname) {
         return {
            id: String(verified.payload.sub),
            nickname: String(verified.payload.nickname),
            email: verified.payload.email ? String(verified.payload.email) : undefined,
            isAdmin: !!verified.payload.is_admin,
         }
      }
   }

   // 2) 호환을 위해 user_id 쿠키도 확인 (닉네임은 없음)
   const userId = request.cookies.get('user_id')?.value
   if (userId) {
      // user_id만 있는 경우 - 닉네임을 알 수 없으므로 DB 조회 필요
      // 이 경우는 null 반환하고, 필요시 별도 처리
      return null
   }

   return null
}

/**
 * 인증이 필요한 API에서 사용 - 인증되지 않으면 에러 반환용 정보 제공
 */
export function requireAuth(request: NextRequest): { user: AuthUser } | { error: string; status: number } {
   const user = getAuthUser(request)

   if (!user) {
      return { error: '로그인이 필요합니다.', status: 401 }
   }

   return { user }
}
