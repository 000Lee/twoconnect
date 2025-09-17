'use client'
import React, { useState } from 'react'
import styled from 'styled-components'

/**
 * 로그인 페이지 – TwoConnect
 * - 그래프페이퍼 느낌의 배경 (repeating-linear-gradient)
 * - 중앙 카드, 타이틀, 입력 2개, 로그인 버튼, 보조 액션
 * - 접근성: label + htmlFor, :focus 스타일
 */

export default function LoginPage() {
   const [isLogin, setIsLogin] = useState(true)
   const [email, setEmail] = useState('')
   const [nickname, setNickname] = useState('')
   const [password, setPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('')
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [success, setSuccess] = useState('')

   async function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      setError('')
      setSuccess('')
      setLoading(true)

      try {
         if (isLogin) {
            // 로그인 로직
            const response = await fetch('/api/auth/login', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (data.success) {
               setSuccess('로그인 성공! 메인 페이지로 이동합니다...')
               setTimeout(() => {
                  window.location.href = '/'
               }, 1500)
            } else {
               setError(data.error || '로그인에 실패했습니다.')
            }
         } else {
            // 회원가입 로직
            if (password !== confirmPassword) {
               setError('비밀번호가 일치하지 않습니다.')
               setLoading(false)
               return
            }

            if (password.length < 6) {
               setError('비밀번호는 최소 6자 이상이어야 합니다.')
               setLoading(false)
               return
            }

            const response = await fetch('/api/auth/signup', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email, password, nickname }),
            })

            const data = await response.json()

            if (data.success) {
               setSuccess('회원가입 성공! 로그인해주세요.')
               setIsLogin(true)
               setEmail('')
               setNickname('')
               setPassword('')
               setConfirmPassword('')
            } else {
               setError(data.error || '회원가입에 실패했습니다.')
            }
         }
      } catch (err) {
         setError('서버 오류가 발생했습니다.')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Root>
         <BG aria-hidden>
            <BGPattern />
         </BG>

         <Safe>
            <Card onSubmit={onSubmit}>
               <Logo>TwoConnect</Logo>
               <Subtitle>{isLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}</Subtitle>

               {error && <ErrorMessage>{error}</ErrorMessage>}
               {success && <SuccessMessage>{success}</SuccessMessage>}

               <Field>
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일을 입력하세요" autoComplete="email" required />
               </Field>

               {!isLogin && (
                  <Field>
                     <Label htmlFor="nickname">닉네임</Label>
                     <Input id="nickname" name="nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임을 입력하세요" autoComplete="nickname" required />
                  </Field>
               )}

               <Field>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력하세요" autoComplete="current-password" required />
               </Field>

               {!isLogin && (
                  <Field>
                     <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                     <Input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호를 다시 입력하세요" autoComplete="new-password" required />
                  </Field>
               )}

               <PrimaryButton type="submit" disabled={loading}>
                  {loading ? '처리중...' : isLogin ? '로그인' : '회원가입'}
               </PrimaryButton>

               <Actions>
                  <ActionButton
                     type="button"
                     onClick={() => {
                        setIsLogin(!isLogin)
                        setError('')
                        setSuccess('')
                        setEmail('')
                        setNickname('')
                        setPassword('')
                        setConfirmPassword('')
                     }}
                  >
                     {isLogin ? '회원가입' : '로그인'}
                  </ActionButton>
                  {isLogin && (
                     <>
                        <Divider aria-hidden>·</Divider>
                        <ActionButton type="button">비밀번호 찾기</ActionButton>
                     </>
                  )}
               </Actions>
            </Card>
         </Safe>
      </Root>
   )
}

/* ===================== Styled ===================== */

const Root = styled.main`
   position: relative;
   min-height: 100vh;
   overflow: hidden;
   background: #fff;
`

/** 배경: 얇은 회색 격자 (1920 캔버스 느낌) */
const BG = styled.div`
   position: absolute;
   inset: 0;
   pointer-events: none;
`

const BGPattern = styled.div`
   position: absolute;
   inset: 0;
   opacity: 0.55;

   /* 8px 세로/가로 라인 + 40px 굵은 라인으로 그래프 종이 느낌 */
   background-image:
    /* 굵은 라인 */ linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px), /* 얇은 라인 */ repeating-linear-gradient(to right, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 8px),
      repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 8px);
   background-size: 40px 40px, 40px 40px, /* 굵은 라인 간격 */ 8px 8px, 8px 8px; /* 얇은 라인 간격 */
   background-position: 0 0, 0 0, 0 0, 0 0;
`

/** 중앙 정렬 안전영역 */
const Safe = styled.div`
   position: relative;
   z-index: 1;
   min-height: 100vh;
   display: grid;
   place-items: start center;
   padding-top: clamp(80px, 12vh, 160px);
   padding-inline: 16px;
`

/** 로그인 카드 */
const Card = styled.form`
   width: min(420px, 92vw);
   display: grid;
   gap: 14px;
   padding: 28px 26px 24px;
   border: 1px solid #c9c9c9;
   border-radius: 12px;
   background: rgba(255, 255, 255, 0.9);
   backdrop-filter: blur(2px);
   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`

const Logo = styled.h1`
   margin: 0 0 8px;
   font-size: 28px;
   font-weight: 600;
   letter-spacing: 0.2px;
   text-align: center;
`

const Subtitle = styled.p`
   margin: 0 0 20px;
   font-size: 14px;
   color: #666;
   text-align: center;
`

const Field = styled.div`
   display: grid;
   gap: 6px;
`

const Label = styled.label`
   font-size: 12px;
   color: #666;
`

const Input = styled.input`
   height: 40px;
   padding: 0 12px;
   border: 1px solid #cfcfcf;
   border-radius: 8px;
   background: #fff;
   font-size: 14px;

   &:hover {
      border-color: #b9b9b9;
   }
   &:focus {
      outline: none;
      border-color: #7aa7ff;
      box-shadow: 0 0 0 3px rgba(122, 167, 255, 0.25);
   }

   &::placeholder {
      color: #b5b5b5;
   }
`

const PrimaryButton = styled.button`
   margin-top: 4px;
   height: 40px;
   border: 0;
   border-radius: 8px;
   background: #111;
   color: #fff;
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;

   &:hover:not(:disabled) {
      filter: brightness(1.05);
   }
   &:active:not(:disabled) {
      transform: translateY(1px);
   }

   &:disabled {
      background: #999;
      cursor: not-allowed;
   }
`

const Actions = styled.div`
   margin-top: 4px;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 10px;
   font-size: 12px;
   color: #666;
`

const ActionButton = styled.button`
   padding: 0;
   border: 0;
   background: none;
   color: inherit;
   cursor: pointer;
   text-decoration: underline;
   text-underline-offset: 2px;
`

const Divider = styled.span``

const ErrorMessage = styled.div`
   padding: 8px 12px;
   background: #fef2f2;
   border: 1px solid #fecaca;
   border-radius: 6px;
   color: #dc2626;
   font-size: 12px;
   text-align: center;
`

const SuccessMessage = styled.div`
   padding: 8px 12px;
   background: #f0fdf4;
   border: 1px solid #bbf7d0;
   border-radius: 6px;
   color: #16a34a;
   font-size: 12px;
   text-align: center;
`
