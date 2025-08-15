'use client'
import React from 'react'
import styled from 'styled-components'

/**
 * 로그인 페이지 – TwoConnect
 * - 그래프페이퍼 느낌의 배경 (repeating-linear-gradient)
 * - 중앙 카드, 타이틀, 입력 2개, 로그인 버튼, 보조 액션
 * - 접근성: label + htmlFor, :focus 스타일
 */

export default function LoginPage() {
   function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      // TODO: 실제 로그인 로직 연결
   }

   return (
      <Root>
         <BG aria-hidden>
            <BGPattern />
         </BG>

         <Safe>
            <Card onSubmit={onSubmit}>
               <Logo>TwoConnect</Logo>

               <Field>
                  <Label htmlFor="username">아이디</Label>
                  <Input id="username" name="username" placeholder="아이디" autoComplete="username" />
               </Field>

               <Field>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input id="password" name="password" type="password" placeholder="비밀번호" autoComplete="current-password" />
               </Field>

               <PrimaryButton type="submit">로그인</PrimaryButton>

               <Actions>
                  <ActionButton type="button">회원가입</ActionButton>
                  <Divider aria-hidden>·</Divider>
                  <ActionButton type="button">비밀번호 찾기</ActionButton>
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

   &:hover {
      filter: brightness(1.05);
   }
   &:active {
      transform: translateY(1px);
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
