'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
   id: string
   nickname: string
   email: string
   isAdmin?: boolean
}

interface AuthContextType {
   user: User | null
   loading: boolean
   isAdmin: boolean
   login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
   logout: () => Promise<void>
   checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)
   const [isAdmin, setIsAdmin] = useState(false)

   // 인증 상태 확인
   const checkAuth = async () => {
      try {
         console.log('🔐 인증 상태 확인 시작')
         const response = await fetch('/api/auth/me', {
            credentials: 'include', // 쿠키 포함
         })

         console.log('🔐 인증 API 응답:', response.status, response.statusText)

         if (response.ok) {
            const userData = await response.json()
            setUser(userData.user)

            // Admin 권한 확인
            const adminResponse = await fetch('/api/auth/admin', {
               credentials: 'include',
            })
            if (adminResponse.ok) {
               const adminData = await adminResponse.json()
               setIsAdmin(adminData.isAdmin || false)
            }
         } else {
            setUser(null)
            setIsAdmin(false)
         }
      } catch (error) {
         console.error('인증 확인 오류:', error)
         setUser(null)
         setIsAdmin(false)
      } finally {
         setLoading(false)
      }
   }

   // 로그인
   const login = async (email: string, password: string) => {
      try {
         const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 쿠키 포함
            body: JSON.stringify({ email, password }),
         })

         const data = await response.json()

         if (data.success) {
            setUser({
               id: data.user_id,
               nickname: data.nickname,
               email: email,
            })
            return { success: true }
         } else {
            return { success: false, error: data.error }
         }
      } catch (error) {
         return { success: false, error: '서버 오류가 발생했습니다.' }
      }
   }

   // 로그아웃
   const logout = async () => {
      try {
         await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
         })
      } catch (error) {
         console.error('로그아웃 오류:', error)
      } finally {
         setUser(null)
      }
   }

   useEffect(() => {
      checkAuth()
   }, [])

   return <AuthContext.Provider value={{ user, loading, isAdmin, login, logout, checkAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
   const context = useContext(AuthContext)
   if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider')
   }
   return context
}
