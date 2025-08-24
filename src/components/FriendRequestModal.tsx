'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

interface FriendRequest {
  id: number
  from_nickname: string
  created_at: string
}

interface FriendRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FriendRequestModal({ isOpen, onClose }: FriendRequestModalProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchFriendRequests()
    }
  }, [isOpen])

  const fetchFriendRequests = async () => {
    try {
      setLoading(true)
      const userNickname = localStorage.getItem('user_nickname')
      if (!userNickname) return

      const response = await fetch(`/api/connections/requests?userId=${userNickname}`)
      const result = await response.json()
      
      if (result.success) {
        setRequests(result.requests)
      }
    } catch (error) {
      console.error('친구요청 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const userNickname = localStorage.getItem('user_nickname')
      if (!userNickname) return

      const response = await fetch(`/api/connections/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userNickname
        }
      })

      const result = await response.json()
      if (result.success) {
        // 요청 목록에서 제거
        setRequests(prev => prev.filter(req => req.id !== requestId))
        // 상단 칩 새로고침 이벤트 발생
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('connections:updated'))
        }
        alert('친구 요청을 수락했습니다!')
      } else {
        alert('친구 요청 수락에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('친구요청 수락 오류:', error)
      alert('친구 요청 수락 중 오류가 발생했습니다.')
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    try {
      const userNickname = localStorage.getItem('user_nickname')
      if (!userNickname) return

      const response = await fetch(`/api/connections/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userNickname
        }
      })

      const result = await response.json()
      if (result.success) {
        // 요청 목록에서 제거
        setRequests(prev => prev.filter(req => req.id !== requestId))
        alert('친구 요청을 거절했습니다.')
      } else {
        alert('친구 요청 거절에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('친구요청 거절 오류:', error)
      alert('친구 요청 거절 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>친구 요청</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : requests.length === 0 ? (
            <EmptyText>받은 친구 요청이 없습니다.</EmptyText>
          ) : (
            <RequestList>
              {requests.map((request) => (
                <RequestItem key={request.id}>
                  <RequestInfo>
                    <RequestNickname>{request.from_nickname}</RequestNickname>
                    <RequestDate>
                      {new Date(request.created_at).toLocaleDateString('ko-KR')}
                    </RequestDate>
                  </RequestInfo>
                  <RequestActions>
                    <AcceptButton onClick={() => handleAcceptRequest(request.id)}>
                      수락
                    </AcceptButton>
                    <RejectButton onClick={() => handleRejectRequest(request.id)}>
                      거절
                    </RejectButton>
                  </RequestActions>
                </RequestItem>
              ))}
            </RequestList>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  )
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #374151;
  }
`

const ModalBody = styled.div`
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
`

const LoadingText = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
`

const EmptyText = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 40px 0;
`

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const RequestItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
`

const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const RequestNickname = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #111827;
`

const RequestDate = styled.span`
  font-size: 12px;
  color: #6b7280;
`

const RequestActions = styled.div`
  display: flex;
  gap: 8px;
`

const AcceptButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #059669;
  }
`

const RejectButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
`
