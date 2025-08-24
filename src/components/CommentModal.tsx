'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

interface Comment {
  id: number
  post_id: number
  nickname: string
  content: string
  created_at: string
}

interface EditingComment {
  id: number
  content: string
}

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  postId: number
  postContent: string
}

export default function CommentModal({ isOpen, onClose, postId, postContent }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userNickname, setUserNickname] = useState<string>('')
  const [editingComment, setEditingComment] = useState<EditingComment | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const nickname = localStorage.getItem('user_nickname')
    if (nickname) {
      setUserNickname(nickname)
      fetchComments()
    }
  }, [isOpen, postId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?postId=${postId}`)
      const result = await response.json()
      
      if (result.success) {
        setComments(result.comments || [])
      }
    } catch (error) {
      console.error('댓글 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !userNickname) return

    console.log('댓글 작성 시도:', { postId, content: newComment.trim(), userNickname })

    try {
      setSubmitting(true)
      const requestBody = {
        postId,
        content: newComment.trim()
      }
      console.log('요청 본문:', requestBody)

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-nickname': userNickname
        },
        body: JSON.stringify(requestBody)
      })

      console.log('응답 상태:', response.status)
      const result = await response.json()
      console.log('응답 결과:', result)

      if (result.success) {
        setNewComment('')
        fetchComments() // 댓글 목록 새로고침
        console.log('댓글 작성 성공')
      } else {
        console.error('댓글 작성 실패:', result.error)
        alert('댓글 작성에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-nickname': userNickname
        }
      })

      const result = await response.json()
      if (result.success) {
        fetchComments() // 댓글 목록 새로고침
      } else {
        alert('댓글 삭제에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleEditComment = (comment: Comment) => {
    setEditingComment({ id: comment.id, content: comment.content })
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const handleUpdateComment = async () => {
    if (!editingComment || !editContent.trim()) return

    try {
      const response = await fetch(`/api/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-nickname': userNickname
        },
        body: JSON.stringify({
          content: editContent.trim()
        })
      })

      const result = await response.json()
      if (result.success) {
        setEditingComment(null)
        setEditContent('')
        fetchComments() // 댓글 목록 새로고침
      } else {
        alert('댓글 수정에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error)
      alert('댓글 수정 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>댓글</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <PostPreview>
          <PostContent>{postContent}</PostContent>
        </PostPreview>

        <CommentForm onSubmit={handleSubmitComment}>
          <CommentInput
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            disabled={submitting}
            required
          />
          <SubmitButton type="submit" disabled={submitting || !newComment.trim()}>
            {submitting ? '작성 중...' : '댓글 작성'}
          </SubmitButton>
        </CommentForm>

        <CommentsSection>
          <CommentsTitle>댓글 {comments.length}개</CommentsTitle>
          {loading ? (
            <LoadingText>댓글을 불러오는 중...</LoadingText>
          ) : comments.length === 0 ? (
            <EmptyText>아직 댓글이 없습니다.</EmptyText>
          ) : (
                         <CommentsList>
               {comments.map((comment) => (
                 <CommentItem key={comment.id}>
                   <CommentHeader>
                     <CommentNickname>{comment.nickname}</CommentNickname>
                     <CommentDate>
                     {new Date(comment.created_at).toLocaleString('ko-KR', {
                         year: 'numeric',
                         month: '2-digit',
                         day: '2-digit',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </CommentDate>
                   </CommentHeader>
                   
                   {editingComment?.id === comment.id ? (
                     <EditForm>
                       <EditTextarea
                         value={editContent}
                         onChange={(e) => setEditContent(e.target.value)}
                         placeholder="댓글을 수정하세요..."
                       />
                       <EditButtons>
                         <SaveButton onClick={handleUpdateComment}>저장</SaveButton>
                         <CancelEditButton onClick={handleCancelEdit}>취소</CancelEditButton>
                       </EditButtons>
                     </EditForm>
                   ) : (
                     <>
                       <CommentContent>{comment.content}</CommentContent>
                       {comment.nickname === userNickname && (
                         <CommentActions>
                           <EditButton onClick={() => handleEditComment(comment)}>
                             수정
                           </EditButton>
                           <DeleteButton onClick={() => handleDeleteComment(comment.id)}>
                             삭제
                           </DeleteButton>
                         </CommentActions>
                       )}
                     </>
                   )}
                 </CommentItem>
               ))}
             </CommentsList>
          )}
        </CommentsSection>
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

const PostPreview = styled.div`
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`

const PostContent = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
`

const CommentForm = styled.form`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
`

const CommentInput = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 40px;
  max-height: 120px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`

const SubmitButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: #6c5ce7;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #5a4fcf;
  }
  
  &:disabled {
    background: #b8b5e6;
    cursor: not-allowed;
  }
`

const CommentsSection = styled.div`
  padding: 20px 24px;
  max-height: 300px;
  overflow-y: auto;
`

const CommentsTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
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

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const CommentItem = styled.div`
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  position: relative;
`

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const CommentNickname = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
`

const CommentDate = styled.span`
  font-size: 12px;
  color: #6b7280;
`

const CommentContent = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 8px;
`

const CommentActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
`

const EditButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
  }
`

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background: #fef2f2;
  }
`

const EditForm = styled.div`
  margin-top: 8px;
`

const EditTextarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  margin-bottom: 8px;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.1);
  }
`

const EditButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

const SaveButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #059669;
  }
`

const CancelEditButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #4b5563;
  }
`
