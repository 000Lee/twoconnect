'use client'

import React, { useState } from 'react'
import styled from 'styled-components'

interface AdminModalProps {
   isOpen: boolean
   onClose: () => void
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
   const [email, setEmail] = useState('')
   const [loading, setLoading] = useState(false)
   const [message, setMessage] = useState('')

   const handleMakeAdmin = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setMessage('')

      try {
         const response = await fetch('/api/admin/make-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ targetEmail: email }),
         })

         const result = await response.json()

         if (result.success) {
            setMessage(` ${result.message}`)
            setEmail('')
         } else {
            setMessage(` ${result.error}`)
         }
      } catch (error) {
         setMessage(' 서버 오류가 발생했습니다.')
      } finally {
         setLoading(false)
      }
   }

   if (!isOpen) return null

   return (
      <Overlay onClick={onClose}>
         <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
               <Title>Admin 관리</Title>
               <CloseButton onClick={onClose}>×</CloseButton>
            </ModalHeader>

            <ModalContent>
               <Form onSubmit={handleMakeAdmin}>
                  <Field>
                     <Label>이메일 주소</Label>
                     <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin으로 만들 사용자의 이메일" required />
                  </Field>

                  <Button type="submit" disabled={loading}>
                     {loading ? '처리중...' : 'Admin 권한 부여'}
                  </Button>

                  {message && <Message>{message}</Message>}
               </Form>

               <InfoSection>
                  <InfoTitle>Admin 권한이란?</InfoTitle>
                  <InfoList>
                     <InfoItem>• 공지사항 작성 및 관리</InfoItem>
                     <InfoItem>• 다른 사용자에게 admin 권한 부여</InfoItem>
                     <InfoItem>• 시스템 관리 기능 접근</InfoItem>
                  </InfoList>
               </InfoSection>
            </ModalContent>
         </ModalContainer>
      </Overlay>
   )
}

const Overlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: rgba(0, 0, 0, 0.5);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 1000;
`

const ModalContainer = styled.div`
   background: white;
   border-radius: 12px;
   width: 90%;
   max-width: 500px;
   max-height: 80vh;
   display: flex;
   flex-direction: column;
   box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`

const ModalHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 20px 24px;
   border-bottom: 1px solid #e5e7eb;
`

const Title = styled.h2`
   margin: 0;
   font-size: 18px;
   font-weight: 600;
   color: #1f2937;
`

const CloseButton = styled.button`
   background: none;
   border: none;
   font-size: 24px;
   color: #6b7280;
   cursor: pointer;
   padding: 0;
   width: 32px;
   height: 32px;
   display: flex;
   align-items: center;
   justify-content: center;

   &:hover {
      color: #374151;
   }
`

const ModalContent = styled.div`
   flex: 1;
   overflow-y: auto;
   padding: 24px;
`

const Form = styled.form`
   display: flex;
   flex-direction: column;
   gap: 16px;
   margin-bottom: 24px;
`

const Field = styled.div`
   display: flex;
   flex-direction: column;
   gap: 8px;
`

const Label = styled.label`
   font-size: 14px;
   font-weight: 500;
   color: #374151;
`

const Input = styled.input`
   padding: 12px;
   border: 1px solid #d1d5db;
   border-radius: 6px;
   font-size: 14px;

   &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
   }
`

const Button = styled.button`
   background: #3b82f6;
   color: white;
   border: none;
   border-radius: 6px;
   padding: 12px;
   font-size: 14px;
   font-weight: 500;
   cursor: pointer;

   &:hover:not(:disabled) {
      background: #2563eb;
   }

   &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
   }
`

const Message = styled.div`
   padding: 12px;
   border-radius: 6px;
   font-size: 14px;
   background: #f3f4f6;
   color: #374151;
`

const InfoSection = styled.div`
   border-top: 1px solid #e5e7eb;
   padding-top: 16px;
`

const InfoTitle = styled.h3`
   margin: 0 0 12px 0;
   font-size: 16px;
   font-weight: 600;
   color: #1f2937;
`

const InfoList = styled.ul`
   margin: 0;
   padding-left: 20px;
   color: #6b7280;
   font-size: 14px;
   line-height: 1.6;
`

const InfoItem = styled.li`
   margin-bottom: 4px;
`
