'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import FriendRequestModal from './FriendRequestModal'
import MyPostsModal from './MyPostsModal'
import FriendManagementModal from './FriendManagementModal'
import PostCheckModal from './PostCheckModal'
import BookmarkModal from './BookmarkModal'

export default function AppHeader() {
   const [nickname, setNickname] = useState<string | null>(null)
   const [isDropdownOpen, setIsDropdownOpen] = useState(false)
   const [isFriendRequestModalOpen, setIsFriendRequestModalOpen] = useState(false)
   const [isMyPostsModalOpen, setIsMyPostsModalOpen] = useState(false)
   const [isFriendManagementModalOpen, setIsFriendManagementModalOpen] = useState(false)
   const [isPostCheckModalOpen, setIsPostCheckModalOpen] = useState(false)
   const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)

   useEffect(() => {
      // localStorage에서 닉네임 확인
      const savedNickname = localStorage.getItem('user_nickname')
      if (savedNickname) {
         setNickname(savedNickname)
      }
   }, [])

   const handleLogout = () => {
      localStorage.removeItem('user_nickname')
      setNickname(null)
      window.location.href = '/'
   }

   const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen)
   }

   const closeDropdown = () => {
      setIsDropdownOpen(false)
   }

   const handleMenuClick = (menuType: string) => {
      console.log(`${menuType} 메뉴 클릭됨`)

      if (menuType === '친구요청') {
         setIsFriendRequestModalOpen(true)
      } else if (menuType === '친구관리') {
         setIsFriendManagementModalOpen(true)
      } else if (menuType === '내가쓴글') {
         setIsMyPostsModalOpen(true)
      } else if (menuType === '체크') {
         setIsPostCheckModalOpen(true)
      } else if (menuType === '책갈피') {
         setIsBookmarkModalOpen(true)
      }
      // TODO: 다른 메뉴들에 따른 동작 구현

      closeDropdown()
   }

   return (
      <HeaderWrap>
         <TopBar>
            <TopBarInner>
               <TopLeft as="a" href="/" style={{ fontSize: '20px', fontWeight: 100, color: 'black', textDecoration: 'none' }}>
                  TwoConnect<span>2</span>
               </TopLeft>

               <TopRight>
                  {nickname ? (
                     <UserSection>
                        <UserNickname onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                           {nickname}님<DropdownArrow isOpen={isDropdownOpen}>▼</DropdownArrow>
                        </UserNickname>

                        {isDropdownOpen && (
                           <DropdownMenu>
                              <DropdownItem onClick={() => handleMenuClick('친구요청')}>친구요청</DropdownItem>
                              <DropdownItem onClick={() => handleMenuClick('친구관리')}>친구관리</DropdownItem>
                              <DropdownItem onClick={() => handleMenuClick('체크')}>체크</DropdownItem>
                              <DropdownItem onClick={() => handleMenuClick('책갈피')}>책갈피</DropdownItem>
                              <DropdownItem onClick={() => handleMenuClick('내가쓴글')}>내가쓴글</DropdownItem>
                           </DropdownMenu>
                        )}

                        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
                     </UserSection>
                  ) : (
                     <LoginLink as="a" href="/login" style={{ fontSize: '14px', fontWeight: '400', color: 'black', cursor: 'pointer' }}>
                        로그인
                     </LoginLink>
                  )}
               </TopRight>
            </TopBarInner>
         </TopBar>

         {/* 드롭다운 외부 클릭 시 닫기 */}
         {isDropdownOpen && <DropdownOverlay onClick={closeDropdown} />}

         {/* 친구요청 모달 */}
         <FriendRequestModal isOpen={isFriendRequestModalOpen} onClose={() => setIsFriendRequestModalOpen(false)} />

         {/* 내가쓴글 모달 */}
         <MyPostsModal isOpen={isMyPostsModalOpen} onClose={() => setIsMyPostsModalOpen(false)} />

         {/* 친구관리 모달 */}
         <FriendManagementModal isOpen={isFriendManagementModalOpen} onClose={() => setIsFriendManagementModalOpen(false)} />

         {/* 체크 모달 */}
         <PostCheckModal isOpen={isPostCheckModalOpen} onClose={() => setIsPostCheckModalOpen(false)} />

         {/* 책갈피 모달 */}
         <BookmarkModal isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />
      </HeaderWrap>
   )
}

const HeaderWrap = styled.header`
   position: sticky;
   top: 0;
   z-index: 10;
`

const TopBar = styled.div`
   background: white;
   border-bottom: 1px solid #e5e7eb;
`

const TopBarInner = styled.div`
   max-width: var(--container-max);
   margin: 0 auto;
   padding-inline: var(--safe-x);
   height: 100px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   font-size: 13px;
   color: #7a7a7a;
`

const TopLeft = styled.div`
   position: relative;
   span {
      position: absolute;
      left: 0;
      transform: translate(10px, -15px);
      z-index: 2;
      font-size: 40px;
      font-weight: 100;
      opacity: 0.3;
   }
`

const TopRight = styled.div``

const UserSection = styled.div`
   display: flex;
   align-items: center;
   gap: 12px;
   position: relative;
`

const UserNickname = styled.span`
   font-size: 14px;
   font-weight: 500;
   color: #333;
   cursor: pointer;
   display: flex;
   align-items: center;
   gap: 4px;
   padding: 4px 8px;
   border-radius: 8px;
   transition: background-color 0.2s ease;

   &:hover {
      background-color: #f0f0f0;
   }
`

const LoginLink = styled.a`
   font-size: 14px;
   font-weight: 400;
   color: black;
   cursor: pointer;
   text-decoration: none;
`

const LogoutButton = styled.button`
   background: none;
   border: none;
   font-size: 12px;
   color: #666;
   cursor: pointer;
   text-decoration: underline;

   &:hover {
      color: #333;
   }
`

const DropdownArrow = styled.span.withConfig({
   shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
   font-size: 12px;
   transform: ${(props) => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
   transition: transform 0.2s ease;
`

const DropdownMenu = styled.div`
   position: absolute;
   top: 100%; /* 버튼 아래에 메뉴 배치 */
   right: 0;
   background: white;
   border: 1px solid #e0e0e0;
   border-radius: 8px;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
   z-index: 100;
   min-width: 150px;
   padding: 8px 0;
   margin-top: 4px;
`

const DropdownItem = styled.div`
   padding: 8px 12px;
   font-size: 13px;
   color: #333;
   cursor: pointer;
   transition: background-color 0.2s ease;

   &:hover {
      background-color: #f0f0f0;
   }
`

const DropdownOverlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   z-index: 99;
`
