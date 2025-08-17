'use client'

import { useState } from 'react'
import styled from 'styled-components'
import SignupForm from '@/components/auth/SignupForm'
import LoginForm from '@/components/auth/LoginForm'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    // 로그인/회원가입 성공 후 처리
    setTimeout(() => {
      window.location.href = '/' // 메인 페이지로 리다이렉트
    }, 1500)
  }

  const handleSwitchToSignup = () => {
    setIsLogin(false)
  }

  const handleSwitchToLogin = () => {
    setIsLogin(true)
  }

  if (isAuthenticated) {
    return (
      <SuccessContainer>
        <SuccessMessage>
          <h2>🎉 성공!</h2>
          <p>{isLogin ? '로그인' : '회원가입'}이 완료되었습니다.</p>
          <p>메인 페이지로 이동합니다...</p>
        </SuccessMessage>
      </SuccessContainer>
    )
  }

  return (
    <Container>
      <Header>
        <Title>TwoConnect</Title>
        <Subtitle>계정에 로그인하거나 새 계정을 만드세요</Subtitle>
      </Header>

      {isLogin ? (
        <LoginForm 
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={handleSwitchToSignup}
        />
      ) : (
        <SignupForm 
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </Container>
  )
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  color: white;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`

const SuccessContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const SuccessMessage = styled.div`
  text-align: center;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }
`
