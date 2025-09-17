'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAuth } from '@/contexts/AuthContext'
import NoticeWriteModal from './NoticeWriteModal'
import NoticeEditModal from './NoticeEditModal'

interface NoticeModalProps {
   isOpen: boolean
   onClose: () => void
}

interface Notice {
   id: number
   title: string
   content: string
   created_at: string
   is_important: boolean
}

export default function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
   const { isAdmin } = useAuth()
   const [notices, setNotices] = useState<Notice[]>([])
   const [loading, setLoading] = useState(false)
   const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
   const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
   const [editingNotice, setEditingNotice] = useState<Notice | null>(null)

   useEffect(() => {
      if (isOpen) {
         fetchNotices()
      }
   }, [isOpen])

   const fetchNotices = async () => {
      setLoading(true)
      try {
         const response = await fetch('/api/notices')
         const result = await response.json()
         if (result.success) {
            setNotices(result.notices || [])
         }
      } catch (error) {
         console.error('공지사항 조회 오류:', error)
      } finally {
         setLoading(false)
      }
   }

   const handleNoticeClick = (notice: Notice) => {
      setSelectedNotice(notice)
   }

   const handleBackToList = () => {
      setSelectedNotice(null)
   }

   const handleWriteSuccess = () => {
      fetchNotices() // 공지사항 목록 새로고침
      // 작성 후 목록으로 돌아가기 (상세보기 상태 초기화)
      setSelectedNotice(null)
   }

   const handleEditNotice = (notice: Notice) => {
      setEditingNotice(notice)
      setIsEditModalOpen(true)
   }

   const handleDeleteNotice = async (noticeId: string) => {
      if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
         return
      }

      try {
         const response = await fetch(`/api/notices?id=${noticeId}`, {
            method: 'DELETE',
            credentials: 'include',
         })

         const result = await response.json()

         if (result.success) {
            alert('✅ 공지사항이 삭제되었습니다.')
            fetchNotices() // 목록 새로고침
            setSelectedNotice(null) // 상세보기에서 목록으로 돌아가기
         } else {
            alert(`❌ ${result.error}`)
         }
      } catch (error) {
         alert('❌ 서버 오류가 발생했습니다.')
      }
   }

   const handleEditSuccess = () => {
      fetchNotices() // 공지사항 목록 새로고침
      setSelectedNotice(null) // 상세보기에서 목록으로 돌아가기
   }

   if (!isOpen) return null

   return (
      <Overlay onClick={onClose}>
         <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
               <Title>{selectedNotice ? '공지사항 상세' : '공지사항'}</Title>
               <HeaderButtons>
                  {isAdmin && !selectedNotice && <WriteButton onClick={() => setIsWriteModalOpen(true)}>✏️ 작성</WriteButton>}
                  <CloseButton onClick={onClose}>×</CloseButton>
               </HeaderButtons>
            </ModalHeader>

            <ModalContent>
               {loading ? (
                  <LoadingMessage>공지사항을 불러오는 중...</LoadingMessage>
               ) : selectedNotice ? (
                  <NoticeDetail>
                     <NoticeDetailHeader>
                        <NoticeTitle>{selectedNotice.title}</NoticeTitle>
                        {isAdmin && (
                           <ActionButtons>
                              <EditButton onClick={() => handleEditNotice(selectedNotice)}>✏️ 수정</EditButton>
                              <DeleteButton onClick={() => handleDeleteNotice(selectedNotice.id)}>🗑️ 삭제</DeleteButton>
                           </ActionButtons>
                        )}
                     </NoticeDetailHeader>
                     <NoticeDate>
                        {new Date(selectedNotice.created_at).toLocaleDateString('ko-KR', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit',
                        })}
                     </NoticeDate>
                     <NoticeContent>{selectedNotice.content}</NoticeContent>
                     <BackButton onClick={handleBackToList}>목록으로 돌아가기</BackButton>
                  </NoticeDetail>
               ) : (
                  <NoticeList>
                     {notices.length === 0 ? (
                        <EmptyMessage>등록된 공지사항이 없습니다.</EmptyMessage>
                     ) : (
                        notices.map((notice) => (
                           <NoticeItem key={notice.id} onClick={() => handleNoticeClick(notice)}>
                              <NoticeItemHeader>
                                 <NoticeItemTitle isImportant={notice.is_important}>
                                    {notice.is_important && '🔔 '}
                                    {notice.title}
                                 </NoticeItemTitle>
                                 <NoticeItemDate>
                                    {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                                       month: '2-digit',
                                       day: '2-digit',
                                    })}
                                 </NoticeItemDate>
                              </NoticeItemHeader>
                              <NoticeItemContent>{notice.content.length > 100 ? `${notice.content.substring(0, 100)}...` : notice.content}</NoticeItemContent>
                           </NoticeItem>
                        ))
                     )}
                  </NoticeList>
               )}
            </ModalContent>
         </ModalContainer>

         {/* 공지사항 작성 모달 */}
         <NoticeWriteModal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} onSuccess={handleWriteSuccess} />

         {/* 공지사항 수정 모달 */}
         <NoticeEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
               setIsEditModalOpen(false)
               setEditingNotice(null)
            }}
            onSuccess={handleEditSuccess}
            notice={editingNotice}
         />
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

const HeaderButtons = styled.div`
   display: flex;
   align-items: center;
   gap: 12px;
`

const WriteButton = styled.button`
   background: #3b82f6;
   color: white;
   border: none;
   border-radius: 6px;
   padding: 8px 16px;
   font-size: 14px;
   font-weight: 500;
   cursor: pointer;

   &:hover {
      background: #2563eb;
   }
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

const LoadingMessage = styled.div`
   text-align: center;
   color: #6b7280;
   font-size: 14px;
   padding: 40px 0;
`

const NoticeList = styled.div`
   display: flex;
   flex-direction: column;
   gap: 12px;
`

const NoticeItem = styled.div`
   border: 1px solid #e5e7eb;
   border-radius: 8px;
   padding: 16px;
   cursor: pointer;
   transition: all 0.2s ease;

   &:hover {
      border-color: #3b82f6;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
   }
`

const NoticeItemHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: 8px;
`

const NoticeItemTitle = styled.h3<{ isImportant: boolean }>`
   margin: 0;
   font-size: 16px;
   font-weight: 600;
   color: ${(props) => (props.isImportant ? '#dc2626' : '#1f2937')};
   flex: 1;
   margin-right: 12px;
`

const NoticeItemDate = styled.span`
   font-size: 12px;
   color: #6b7280;
   white-space: nowrap;
`

const NoticeItemContent = styled.p`
   margin: 0;
   font-size: 14px;
   color: #4b5563;
   line-height: 1.5;
`

const EmptyMessage = styled.div`
   text-align: center;
   color: #6b7280;
   font-size: 14px;
   padding: 40px 0;
`

const NoticeDetail = styled.div`
   display: flex;
   flex-direction: column;
   gap: 16px;
`

const NoticeDetailHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   gap: 16px;
`

const ActionButtons = styled.div`
   display: flex;
   gap: 8px;
`

const EditButton = styled.button`
   background: #3b82f6;
   color: white;
   border: none;
   border-radius: 6px;
   padding: 8px 12px;
   font-size: 12px;
   font-weight: 500;
   cursor: pointer;

   &:hover {
      background: #2563eb;
   }
`

const DeleteButton = styled.button`
   background: #ef4444;
   color: white;
   border: none;
   border-radius: 6px;
   padding: 8px 12px;
   font-size: 12px;
   font-weight: 500;
   cursor: pointer;

   &:hover {
      background: #dc2626;
   }
`

const NoticeTitle = styled.h2`
   margin: 0;
   font-size: 20px;
   font-weight: 600;
   color: #1f2937;
`

const NoticeDate = styled.div`
   font-size: 14px;
   color: #6b7280;
`

const NoticeContent = styled.div`
   font-size: 14px;
   color: #374151;
   line-height: 1.6;
   white-space: pre-wrap;
`

const BackButton = styled.button`
   background: #f3f4f6;
   border: 1px solid #d1d5db;
   border-radius: 6px;
   padding: 8px 16px;
   font-size: 14px;
   color: #374151;
   cursor: pointer;
   align-self: flex-start;

   &:hover {
      background: #e5e7eb;
   }
`
