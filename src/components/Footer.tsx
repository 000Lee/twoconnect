'use client'

import React from 'react'
import styled from 'styled-components'

const FooterContainer = styled.footer`
   background-color: #f8f9fa;
   border-top: 1px solid #e9ecef;
   padding: 3rem 0;
   margin-top: auto;
   text-align: center;
`

const FooterContent = styled.div`
   max-width: 1200px;
   margin: 0 auto;
   padding: 0 1rem;
`

const FooterText = styled.p`
   color: #6c757d;
   font-size: 0.875rem;
   margin: 0;
`

const FooterLinks = styled.div`
   margin-top: 1rem;
   display: flex;
   justify-content: center;
   gap: 2rem;
   flex-wrap: wrap;
`

const FooterLink = styled.a`
   color: #6c757d;
   text-decoration: none;
   font-size: 0.875rem;
   transition: color 0.2s ease;

   &:hover {
      color: #495057;
      text-decoration: underline;
   }
`

const Footer: React.FC = () => {
   return (
      <FooterContainer>
         <FooterContent>
            <FooterText>© 2025 TwoConnect.All rights reserved.</FooterText>
            <FooterLinks>
               <FooterLink href="/privacy">개인정보처리방침</FooterLink>
               <FooterLink href="/terms">이용약관</FooterLink>
               <FooterLink href="/contact">문의하기</FooterLink>
               <FooterLink href="/about">회사소개</FooterLink>
            </FooterLinks>
         </FooterContent>
      </FooterContainer>
   )
}

export default Footer
