'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

interface ConnectionItem {
  id: number
  friend_nickname: string
  created_at: string
}

interface FriendManagementModalProps {
  isOpen: boolean
  onClose: () => void
  userNickname: string
}

export default function FriendManagementModal({ isOpen, onClose, userNickname }: FriendManagementModalProps) {
  const [connections, setConnections] = useState<ConnectionItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userNickname && isOpen) {
      console.log('[친구관리모달] fetchConnections 호출!', userNickname)
      fetchConnections()
    }
  }, [userNickname, isOpen])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/connections?userId=${userNickname}`)
      const result = await response.json()
      
      console.log('[친구관리모달] API 응답:', result)

      if (result.success && result.connections) {
        console.log('[친구관리모달] 연결된 친구들:', result.connections)

        const formattedConnections = result.connections.map((connection: any) => ({
          id: connection.connection_id,
          friend_nickname: connection.friend_nickname,
          created_at: connection.created_at
        }))

        console.log('[친구관리모달] 변환 완료:', formattedConnections)
        setConnections(formattedConnections)
      } else {
        console.error('[친구관리모달] API 응답 실패:', result.error)
      }
    } catch (error) {
      console.error('친구 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConnection = async (connectionId: number) => {
    if (!confirm('친구 연결을 끊으시겠습니까?')) return

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const result = await response.json()
      if (result.success) {
        fetchConnections() // 친구 목록 새로고침
        alert('친구 연결이 끊어졌습니다.')
      } else {
        alert('친구 연결 끊기에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('친구 연결 끊기 오류:', error)
      alert('친구 연결 끊기 중 오류가 발생했습니다.')
    }
  }

  const getFriendNickname = (connection: ConnectionItem) => {
    return connection.friend_nickname
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>친구 관리</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {loading ? (
            <LoadingText>친구 목록을 불러오는 중...</LoadingText>
          ) : connections.length === 0 ? (
            <EmptyText>연결된 친구가 없습니다.</EmptyText>
          ) : (
            <FriendsList>
              {connections.map((connection) => (
                <FriendItem key={connection.id}>
                  <FriendInfo>
                    <FriendNickname>{getFriendNickname(connection)}</FriendNickname>
                    <ConnectionDate>
                      {new Date(connection.created_at).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </ConnectionDate>
                  </FriendInfo>
                  <DeleteButton onClick={() => handleDeleteConnection(connection.id)}>
                    삭제
                  </DeleteButton>
                </FriendItem>
              ))}
            </FriendsList>
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
  right: 0;
  bottom: 0;
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
  padding: 20px 24px 16px;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`

const ModalBody = styled.div`
  padding: 20px 24px;
  max-height: 60vh;
  overflow-y: auto;
`

const LoadingText = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 40px 0;
`

const EmptyText = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 40px 0;
`

const FriendsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
`

const FriendInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const FriendNickname = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #111827;
`

const ConnectionDate = styled.span`
  font-size: 12px;
  color: #6b7280;
`

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #dc2626;
  }
`
