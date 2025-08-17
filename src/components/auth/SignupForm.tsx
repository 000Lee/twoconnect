'use client'

import { useState } from 'react'
import styled from 'styled-components'

interface SignupFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || '회원가입에 실패했습니다.')
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormContainer>
      <Title>회원가입</Title>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>이메일</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
        </InputGroup>
        
        <InputGroup>
          <Label>비밀번호</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </InputGroup>
        
        <InputGroup>
          <Label>비밀번호 확인</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
        </InputGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? '처리중...' : '회원가입'}
        </SubmitButton>
      </Form>

      <SwitchText>
        이미 계정이 있으신가요?{' '}
        <SwitchButton type="button" onClick={onSwitchToLogin}>
          로그인
        </SwitchButton>
      </SwitchText>
    </FormContainer>
  )
}

const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
`

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background: #fdf2f2;
  border-radius: 4px;
`

const SubmitButton = styled.button`
  padding: 0.75rem;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background: #5a4fcf;
  }
  
  &:disabled {
    background: #b8b5e6;
    cursor: not-allowed;
  }
`

const SwitchText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;
`

const SwitchButton = styled.button`
  background: none;
  border: none;
  color: #6c5ce7;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    color: #5a4fcf;
  }
`
