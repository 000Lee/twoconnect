'use client'

import React, { useState } from 'react'
import styled from 'styled-components'

interface FriendAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddFriend: (nickname: string) => Promise<void>
}

export default function FriendAddModal({ isOpen, onClose, onAddFriend }: FriendAddModalProps) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    setLoading(true)
    setError('')

    try {
      await onAddFriend(nickname.trim())
      setNickname('')
      onClose()
    } catch (error) {
      setError('친구 추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>친구 추가</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalForm onSubmit={handleSubmit}>
          <FormField>
            <Label>친구 닉네임</Label>
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="친구의 닉네임을 입력하세요"
              required
              disabled={loading}
            />
          </FormField>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              취소
            </CancelButton>
            <SubmitButton type="submit" disabled={loading || !nickname.trim()}>
              {loading ? '추가 중...' : '친구 추가'}
            </SubmitButton>
          </ButtonGroup>
        </ModalForm>
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
  backdrop-filter: blur(4px);
`

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
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

const ModalForm = styled.form`
  padding: 20px 24px 24px;
`

const FormField = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #6c5ce7;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #5a4fcf;
  }
  
  &:disabled {
    background: #b8b5e6;
    cursor: not-allowed;
  }
`
