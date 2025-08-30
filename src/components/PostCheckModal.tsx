'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { supabase } from '@/lib/supabase'

interface PostCheckModalProps {
   isOpen: boolean
   onClose: () => void
}

interface ConnectionItem {
   connection_id: number
   friend_id: string
   friend_nickname: string
   connection_status: string
   created_at: string
}

interface Post {
   id: number
   content: string
   created_at: string
   user_id: string
   nickname: string
   is_read?: boolean
}

export default function PostCheckModal({ isOpen, onClose }: PostCheckModalProps) {
   const [connections, setConnections] = useState<ConnectionItem[]>([])
   const [loading, setLoading] = useState(false)
   const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
   const [unreadPosts, setUnreadPosts] = useState<Post[]>([])
   const [postsLoading, setPostsLoading] = useState(false)

   useEffect(() => {
      if (!isOpen) return
      const nickname = localStorage.getItem('user_nickname')
      if (!nickname) return
      setLoading(true)
      fetch(`/api/connections?userId=${nickname}`)
         .then((res) => res.json())
         .then((result) => {
            if (result.success) setConnections(result.connections || [])
         })
         .finally(() => setLoading(false))
   }, [isOpen])

   const handleSelectFriend = async (friendId: string) => {
      setSelectedFriend(friendId)
      setPostsLoading(true)

      try {
         const nickname = localStorage.getItem('user_nickname')
         if (!nickname) return

         const response = await fetch(`/api/posts?userId=${nickname}&friendId=${friendId}`)
         const result = await response.json()

         if (result.success) {
            // 친구가 쓴 글만 필터링
            const friendPosts = result.posts.filter((post: any) => post.nickname === friendId)

            if (friendPosts.length > 0) {
               // is_read가 false인 게시물만 필터링 (읽지 않은 게시물)
               const unreadPosts = friendPosts.filter((post: any) => !post.is_read)
               setUnreadPosts(unreadPosts)
            } else {
               setUnreadPosts([])
            }
         }
      } catch (error) {
         console.error('읽지 않은 게시물 조회 오류:', error)
         setUnreadPosts([])
      } finally {
         setPostsLoading(false)
      }
   }

   const handlePostCheck = async (postId: number) => {
      try {
         const userNickname = localStorage.getItem('user_nickname')
         if (!userNickname) return

         // posts 테이블의 is_read를 true로 업데이트
         const { error } = await supabase.from('posts').update({ is_read: true }).eq('id', postId)

         if (error) {
            console.error('게시물 체크 오류:', error)
            return
         }

         // 체크된 게시물을 목록에서 제거
         setUnreadPosts((prev) => prev.filter((post) => post.id !== postId))
      } catch (error) {
         console.error('게시물 체크 오류:', error)
      }
   }

   const handleBackToList = () => {
      setSelectedFriend(null)
      setUnreadPosts([])
   }

   if (!isOpen) return null

   return (
      <ModalOverlay onClick={onClose}>
         <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
               <ModalTitle>{selectedFriend ? '읽지 않은 게시물' : '읽지 않은 게시물 확인'}</ModalTitle>
               <CloseButton onClick={onClose}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
               {!selectedFriend ? (
                  // 친구 목록 화면
                  <>
                     {loading ? (
                        <EmptyText>불러오는 중...</EmptyText>
                     ) : connections.length === 0 ? (
                        <EmptyText>연결된 친구가 없습니다.</EmptyText>
                     ) : (
                        <List>
                           {connections.map((c) => (
                              <ListItem key={c.connection_id} onClick={() => handleSelectFriend(c.friend_id)}>
                                 {c.friend_nickname}
                              </ListItem>
                           ))}
                        </List>
                     )}
                  </>
               ) : (
                  // 읽지 않은 게시물 목록 화면
                  <>
                     <BackButton onClick={handleBackToList}>← 친구 목록으로</BackButton>
                     {postsLoading ? (
                        <EmptyText>게시물을 불러오는 중...</EmptyText>
                     ) : unreadPosts.length === 0 ? (
                        <EmptyText>읽지 않은 게시물이 없습니다.</EmptyText>
                     ) : (
                        <PostsList>
                           {unreadPosts.map((post) => (
                              <PostCard key={post.id}>
                                 <PostHeader>
                                    <span>{post.nickname}</span>
                                    <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                                    <span>{new Date(post.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                 </PostHeader>
                                 <PostBody>{post.content}</PostBody>
                                 <PostActions>
                                    <CheckButton onClick={() => handlePostCheck(post.id)}>읽음 표시</CheckButton>
                                 </PostActions>
                              </PostCard>
                           ))}
                        </PostsList>
                     )}
                  </>
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
   max-width: 600px;
   max-height: 80vh;
   overflow: hidden;
   box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`

const ModalHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 16px 20px;
   border-bottom: 1px solid #e5e7eb;
`

const ModalTitle = styled.h2`
   margin: 0;
   font-size: 16px;
   font-weight: 600;
   color: #111827;
`

const CloseButton = styled.button`
   background: none;
   border: none;
   font-size: 22px;
   color: #6b7280;
   cursor: pointer;
   padding: 0;
`

const ModalBody = styled.div`
   padding: 16px 20px;
   max-height: 60vh;
   overflow-y: auto;
`

const EmptyText = styled.div`
   text-align: center;
   color: #6b7280;
   font-size: 14px;
   padding: 24px 0;
`

const List = styled.div`
   display: flex;
   flex-direction: column;
   gap: 8px;
`

const ListItem = styled.button`
   width: 100%;
   text-align: left;
   padding: 12px;
   border: 1px solid #e5e7eb;
   border-radius: 8px;
   background: #f9fafb;
   cursor: pointer;
   font-size: 14px;
   color: #111827;
   transition: background-color 0.15s ease;

   &:hover {
      background: #eef2ff;
   }
`

const BackButton = styled.button`
   background: none;
   border: none;
   color: #6b7280;
   cursor: pointer;
   font-size: 14px;
   margin-bottom: 16px;
   padding: 8px 0;

   &:hover {
      color: #374151;
   }
`

const PostsList = styled.div`
   display: flex;
   flex-direction: column;
   gap: 12px;
`

const PostCard = styled.article`
   width: 100%;
   display: grid;
   grid-template-rows: auto auto auto;
   border: 1px solid #e5e7eb;
   border-radius: 12px;
   background: #fff;
   overflow: hidden;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
   margin-bottom: 16px;
`

const PostHeader = styled.div`
   display: flex;
   gap: 20px;
   font-size: 13px;
   padding: 16px 16px 0;
   color: #374151;
`

const PostBody = styled.div`
   font-size: 13px;
   line-height: 1.5;
   padding: 0 16px 16px;
   color: #111827;
`

const PostActions = styled.div`
   padding: 0 16px 16px;
   display: flex;
   justify-content: flex-end;
`

const CheckButton = styled.button`
   background: #10b981;
   color: white;
   border: none;
   padding: 8px 16px;
   border-radius: 6px;
   font-size: 12px;
   cursor: pointer;
   transition: background-color 0.2s ease;

   &:hover {
      background: #059669;
   }
`
