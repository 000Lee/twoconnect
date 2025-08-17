'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'

export default function AppHeader() {
   const [nickname, setNickname] = useState<string | null>(null)

   useEffect(() => {
      // localStorage에서 닉네임 확인
      const savedNickname = localStorage.getItem('user_nickname')
      if (savedNickname) {
         setNickname(savedNickname)
      }
   }, [])

   const handleLogout = () => {
      localStorage.removeItem('user_nickname')
      setNickname(null)
      window.location.href = '/'
   }

   return (
      <HeaderWrap>
         <TopBar>
            <TopBarInner>
               <TopLeft as="a" href="/" style={{ fontSize: '20px', fontWeight: 100, color: 'black', textDecoration: 'none' }}>
                  TwoConnect<span>2</span>
               </TopLeft>

               <TopRight>
                  {nickname ? (
                     <UserSection>
                        <UserNickname>{nickname}님</UserNickname>
                        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
                     </UserSection>
                  ) : (
                     <LoginLink as="a" href="/login" style={{ fontSize: '14px', fontWeight: '400', color: 'black', cursor: 'pointer' }}>
                        로그인
                     </LoginLink>
                  )}
               </TopRight>
            </TopBarInner>
         </TopBar>
      </HeaderWrap>
   )
}

const HeaderWrap = styled.header`
   position: sticky;
   top: 0;
   z-index: 10;
`

const TopBar = styled.div`
   background: white;
   border-bottom: 1px solid #e5e7eb;
`

const TopBarInner = styled.div`
   max-width: var(--container-max);
   margin: 0 auto;
   padding-inline: var(--safe-x);
   height: 100px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   font-size: 13px;
   color: #7a7a7a;
`

const TopLeft = styled.div`
   position: relative;
   span {
      position: absolute;
      left: 0;
      transform: translate(10px, -15px);
      z-index: 2;
      font-size: 40px;
      font-weight: 100;
      opacity: 0.3;
   }
`

const TopRight = styled.div``

const UserSection = styled.div`
   display: flex;
   align-items: center;
   gap: 12px;
`

const UserNickname = styled.span`
   font-size: 14px;
   font-weight: 500;
   color: #333;
`

const LoginLink = styled.a`
   font-size: 14px;
   font-weight: 400;
   color: black;
   cursor: pointer;
   text-decoration: none;
`

const LogoutButton = styled.button`
   background: none;
   border: none;
   font-size: 12px;
   color: #666;
   cursor: pointer;
   text-decoration: underline;
   
   &:hover {
      color: #333;
   }
`
