'use client'

import styled from 'styled-components'

export default function AppHeader() {
   return (
      <HeaderWrap>
         <TopBar>
            <TopBarInner>
               <TopLeft as="a" href="/" style={{ fontSize: '20px', fontWeight: 100, color: 'black', textDecoration: 'none' }}>
                  TwoConnect<span>2</span>
               </TopLeft>

               <TopRight as="a" href="/login" style={{ fontSize: '14px', fontWeight: '400', color: 'black', cursor: 'pointer' }}>
                  로그인
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
