'use client'

import React, { useState } from 'react'
import styled from 'styled-components'

interface NoticeWriteModalProps {
   isOpen: boolean
   onClose: () => void
   onSuccess: () => void
}

export default function NoticeWriteModal({ isOpen, onClose, onSuccess }: NoticeWriteModalProps) {
   const [title, setTitle] = useState('')
   const [content, setContent] = useState('')
   const [isImportant, setIsImportant] = useState(false)
   const [loading, setLoading] = useState(false)
   const [message, setMessage] = useState('')

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setMessage('')

      if (!title.trim() || !content.trim()) {
         setMessage('제목과 내용을 모두 입력해주세요.')
         setLoading(false)
         return
      }

      try {
         const response = await fetch('/api/notices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
               title: title.trim(),
               content: content.trim(),
               is_important: isImportant,
            }),
         })

         const result = await response.json()

         if (result.success) {
            setMessage(' 공지사항이 성공적으로 작성되었습니다.')
            setTitle('')
            setContent('')
            setIsImportant(false)
            setTimeout(() => {
               onSuccess()
               onClose()
            }, 1000) // 1.5초에서 1초로 단축
         } else {
            setMessage(`${result.error}`)
         }
      } catch (error) {
         setMessage(' 서버 오류가 발생했습니다.')
      } finally {
         setLoading(false)
      }
   }

   const handleClose = () => {
      setTitle('')
      setContent('')
      setIsImportant(false)
      setMessage('')
      onClose()
   }

   if (!isOpen) return null

   return (
      <Overlay onClick={handleClose}>
         <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
               <Title>공지사항 작성</Title>
               <CloseButton onClick={handleClose}>×</CloseButton>
            </ModalHeader>

            <ModalContent>
               <Form onSubmit={handleSubmit}>
                  <Field>
                     <Label>제목 *</Label>
                     <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지사항 제목을 입력하세요" maxLength={100} required />
                     <CharCount>{title.length}/100</CharCount>
                  </Field>

                  <Field>
                     <Label>내용 *</Label>
                     <TextArea value={content} onChange={(e) => setContent(e.target.value)} placeholder="공지사항 내용을 입력하세요" rows={8} required />
                  </Field>

                  <CheckboxField>
                     <Checkbox type="checkbox" id="important" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                     <CheckboxLabel htmlFor="important">🔔 중요 공지사항으로 설정</CheckboxLabel>
                  </CheckboxField>

                  <ButtonGroup>
                     <CancelButton type="button" onClick={handleClose}>
                        취소
                     </CancelButton>
                     <SubmitButton type="submit" disabled={loading}>
                        {loading ? '작성중...' : '공지사항 작성'}
                     </SubmitButton>
                  </ButtonGroup>

                  {message && <Message>{message}</Message>}
               </Form>
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
   max-width: 600px;
   max-height: 90vh;
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
   gap: 20px;
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

const TextArea = styled.textarea`
   padding: 12px;
   border: 1px solid #d1d5db;
   border-radius: 6px;
   font-size: 14px;
   font-family: inherit;
   resize: vertical;
   min-height: 120px;

   &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
   }
`

const CharCount = styled.span`
   font-size: 12px;
   color: #6b7280;
   text-align: right;
`

const CheckboxField = styled.div`
   display: flex;
   align-items: center;
   gap: 8px;
`

const Checkbox = styled.input`
   width: 16px;
   height: 16px;
   cursor: pointer;
`

const CheckboxLabel = styled.label`
   font-size: 14px;
   color: #374151;
   cursor: pointer;
   user-select: none;
`

const ButtonGroup = styled.div`
   display: flex;
   gap: 12px;
   justify-content: flex-end;
`

const CancelButton = styled.button`
   background: #f3f4f6;
   color: #374151;
   border: 1px solid #d1d5db;
   border-radius: 6px;
   padding: 12px 24px;
   font-size: 14px;
   font-weight: 500;
   cursor: pointer;

   &:hover {
      background: #e5e7eb;
   }
`

const SubmitButton = styled.button`
   background: #3b82f6;
   color: white;
   border: none;
   border-radius: 6px;
   padding: 12px 24px;
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
   text-align: center;
`
