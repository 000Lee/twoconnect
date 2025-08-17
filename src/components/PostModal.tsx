'use client'

import React, { useState } from 'react'
import styled from 'styled-components'

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  initialData?: {
    id: number
    content: string
    imageUrl: string
  }
  onSubmit: (post: { content: string; imageFile: File | null }) => void
  onUpdate?: (id: number, post: { content: string; imageFile: File | null }) => void
}

export default function PostModal({ isOpen, onClose, mode, initialData, onSubmit, onUpdate }: PostModalProps) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // 수정 모드일 때 초기 데이터 설정
  React.useEffect(() => {
    if (mode === 'edit' && initialData) {
      setContent(initialData.content)
      setImagePreview(initialData.imageUrl)
      setImageFile(null) // 수정 모드에서는 새 이미지 파일을 위해 null로 설정
    } else {
      setContent('')
      setImageFile(null)
      setImagePreview('')
    }
  }, [mode, initialData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('선택된 파일:', file.name, file.type, file.size)
      
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }
      
      // 이미지 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      
      setImageFile(file)
      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log('이미지 미리보기 생성됨:', result.substring(0, 100) + '...')
        setImagePreview(result)
      }
      reader.onerror = (error) => {
        console.error('파일 읽기 오류:', error)
        alert('이미지 파일을 읽을 수 없습니다.')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      console.log('제출 데이터:', { content, imageFile, mode })
      console.log('이미지 파일 존재 여부:', !!imageFile)
      console.log('이미지 미리보기 존재 여부:', !!imagePreview)
      
      if (mode === 'edit' && onUpdate && initialData) {
        await onUpdate(initialData.id, { content, imageFile })
      } else {
        await onSubmit({ content, imageFile })
      }
      // 성공 후 폼 초기화
      setContent('')
      setImageFile(null)
      setImagePreview('')
      onClose()
    } catch (error) {
      console.error('Post submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
                 <ModalHeader>
           <ModalTitle>{mode === 'edit' ? '글 수정' : '새 글 작성'}</ModalTitle>
           <CloseButton onClick={onClose}>&times;</CloseButton>
         </ModalHeader>

                 <ModalForm onSubmit={handleSubmit}>

                     <FormField>
             <Label>이미지 업로드</Label>
             <FileInput
               type="file"
               accept="image/*"
               onChange={handleImageChange}
               id="image-upload"
             />
             <FileInputLabel htmlFor="image-upload">
               {imageFile ? imageFile.name : (imagePreview && mode === 'edit' ? '새 이미지 선택 (기존 이미지 있음)' : '이미지를 선택하세요 (선택사항)')}
             </FileInputLabel>
             {imagePreview && (
               <ImagePreview>
                 <img src={imagePreview} alt="미리보기" />
               </ImagePreview>
             )}
           </FormField>

          <FormField>
            <Label>내용</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="글 내용을 입력하세요"
              rows={6}
              required
            />
          </FormField>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              취소
            </CancelButton>
                         <SubmitButton type="submit" disabled={loading}>
               {loading ? (mode === 'edit' ? '수정 중...' : '등록 중...') : (mode === 'edit' ? '수정' : '등록')}
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
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
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`

const FileInput = styled.input`
  display: none;
`

const FileInputLabel = styled.label`
  display: block;
  width: 100%;
  padding: 12px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  font-size: 14px;
  
  &:hover {
    border-color: #6c5ce7;
    background: #f8f9ff;
    color: #6c5ce7;
  }
`

const ImagePreview = styled.div`
  margin-top: 12px;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
