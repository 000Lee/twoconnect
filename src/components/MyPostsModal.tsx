'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PostModal from './PostModal'
import CommentModal from './CommentModal'
import { useAuth } from '@/contexts/AuthContext'

interface ConnectionItem {
   connection_id: number
   friend_id: string
   friend_nickname: string
   connection_status: string
   created_at: string
}

interface MyPostsModalProps {
   isOpen: boolean
   onClose: () => void
}

export default function MyPostsModal({ isOpen, onClose }: MyPostsModalProps) {
   const { user } = useAuth()
   const [connections, setConnections] = useState<ConnectionItem[]>([])
   const [loading, setLoading] = useState(false)
   const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
   const [myPosts, setMyPosts] = useState<any[]>([])
   const [postsLoading, setPostsLoading] = useState(false)
   const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
   const [selectedPostForComment, setSelectedPostForComment] = useState<any>(null)
   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
   const [editingPost, setEditingPost] = useState<any>(null)

   useEffect(() => {
      if (!isOpen || !user) return
      setLoading(true)
      fetch(`/api/connections`, { credentials: 'include' })
         .then((res) => res.json())
         .then((result) => {
            if (result.success) setConnections(result.connections || [])
         })
         .finally(() => setLoading(false))
   }, [isOpen, user])

   // 다른 모달에서 발생한 체크/책갈피 이벤트 수신
   useEffect(() => {
      const handlePostChecked = (event: CustomEvent) => {
         const { postId, isChecked } = event.detail
         setMyPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isChecked } : post)))
      }

      const handlePostBookmarked = (event: CustomEvent) => {
         const { postId, isBookmarked } = event.detail
         setMyPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isBookmarked } : post)))
      }

      window.addEventListener('post:checked', handlePostChecked as EventListener)
      window.addEventListener('post:bookmarked', handlePostBookmarked as EventListener)

      return () => {
         window.removeEventListener('post:checked', handlePostChecked as EventListener)
         window.removeEventListener('post:bookmarked', handlePostBookmarked as EventListener)
      }
   }, [])

   const handleSelectFriend = async (friendId: string) => {
      setSelectedFriend(friendId)
      setPostsLoading(true)

      try {
         if (!user) return

         const response = await fetch(`/api/posts?userId=${user.nickname}&friendId=${friendId}`)
         const result = await response.json()

         if (result.success) {
            // 내가 쓴 글만 필터링
            const onlyMine = result.posts.filter((post: any) => post.nickname === user.nickname)

            // 각 게시물의 체크/책갈피 상태 조회
            const postsWithStatus = await Promise.all(
               onlyMine.map(async (post: any) => {
                  let isChecked = false
                  let isBookmarked = false

                  // 체크 상태 조회
                  try {
                     const checkResponse = await fetch(`/api/posts/${post.id}/check`, {
                        credentials: 'include',
                        headers: {
                           'x-user-nickname': user.nickname,
                        },
                     })
                     const checkResult = await checkResponse.json()
                     if (checkResult.success) {
                        isChecked = checkResult.isChecked
                     }
                  } catch (error) {
                     console.error('체크 상태 조회 오류:', error)
                  }

                  // 책갈피 상태 조회
                  try {
                     const bookmarkResponse = await fetch(`/api/posts/${post.id}/bookmark`, {
                        credentials: 'include',
                        headers: {
                           'x-user-nickname': user.nickname,
                        },
                     })
                     const bookmarkResult = await bookmarkResponse.json()
                     if (bookmarkResult.success) {
                        isBookmarked = bookmarkResult.isBookmarked
                     }
                  } catch (error) {
                     console.error('책갈피 상태 조회 오류:', error)
                  }

                  return {
                     ...post,
                     isChecked,
                     isBookmarked,
                  }
               })
            )

            setMyPosts(postsWithStatus)
         }
      } catch (error) {
         console.error('내가쓴글 조회 오류:', error)
      } finally {
         setPostsLoading(false)
      }
   }

   const handleBackToList = () => {
      setSelectedFriend(null)
      setMyPosts([])
   }

   const handleCheckPost = async (postId: number) => {
      try {
         console.log('=== 포스트 체크/해제 시작 ===')
         console.log('처리할 포스트 ID:', postId)

         if (!user) return

         const response = await fetch(`/api/posts/${postId}/check`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         const result = await response.json()
         if (result.success) {
            console.log('포스트 체크/해제 성공!', result.action)

            // 체크 상태에 따라 게시글 상태 업데이트
            const newCheckedState = result.action === 'checked'
            setMyPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isChecked: newCheckedState } : post)))

            // 다른 모달에 체크 상태 변경 이벤트 전송
            if (typeof window !== 'undefined') {
               window.dispatchEvent(
                  new CustomEvent('post:checked', {
                     detail: {
                        postId: postId,
                        isChecked: newCheckedState,
                     },
                  })
               )
            }
         } else {
            console.error('포스트 체크/해제 실패:', result.error)
            alert('게시글 체크/해제에 실패했습니다: ' + result.error)
         }
      } catch (error) {
         console.error('포스트 체크/해제 오류:', error)
         alert('게시글 체크/해제 중 오류가 발생했습니다.')
      }
   }

   const handleBookmarkPost = async (postId: number) => {
      try {
         console.log('=== 포스트 책갈피/해제 시작 ===')
         console.log('처리할 포스트 ID:', postId)

         if (!user) return

         const response = await fetch(`/api/posts/${postId}/bookmark`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         const result = await response.json()
         if (result.success) {
            console.log('포스트 책갈피/해제 성공!', result.action)

            // 책갈피 상태에 따라 게시글 상태 업데이트
            const newBookmarkedState = result.action === 'bookmarked'
            setMyPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isBookmarked: newBookmarkedState } : post)))

            // 다른 모달에 책갈피 상태 변경 이벤트 전송
            if (typeof window !== 'undefined') {
               window.dispatchEvent(
                  new CustomEvent('post:bookmarked', {
                     detail: {
                        postId: postId,
                        isBookmarked: newBookmarkedState,
                     },
                  })
               )
            }
         } else {
            console.error('포스트 책갈피/해제 실패:', result.error)
            alert('게시글 책갈피/해제에 실패했습니다: ' + result.error)
         }
      } catch (error) {
         console.error('포스트 책갈피/해제 오류:', error)
         alert('게시글 책갈피/해제 중 오류가 발생했습니다.')
      }
   }

   const handleOpenCommentModal = (postId: number, content: string) => {
      setSelectedPostForComment({ id: postId, content })
      setIsCommentModalOpen(true)
   }

   const handleCloseCommentModal = () => {
      setIsCommentModalOpen(false)
      setSelectedPostForComment(null)
   }

   const handleEditPost = (post: any) => {
      setEditingPost(post)
      setIsEditModalOpen(true)
   }

   const handleCloseEditModal = () => {
      setIsEditModalOpen(false)
      setEditingPost(null)
   }

   const handleUpdatePost = async (updatedPost: any) => {
      try {
         console.log('수정 요청 데이터:', updatedPost)
         const userId = user?.id
         if (!userId) return

         console.log('API 요청 데이터:', {
            url: `/api/posts/${updatedPost.id}`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
            body: {
               content: updatedPost.content,
               imageFile: updatedPost.imageUrl ? { data: updatedPost.imageUrl } : null,
            },
         })

         const response = await fetch(`/api/posts/${updatedPost.id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'x-user-id': userId,
            },
            body: JSON.stringify({
               content: updatedPost.content,
               imageFile: updatedPost.imageUrl ? { data: updatedPost.imageUrl } : null,
            }),
         })

         if (response.ok) {
            const result = await response.json()
            if (result.success) {
               // 수정된 포스트를 다시 조회하여 최신 데이터 가져오기
               try {
                  if (user?.nickname) {
                     const fetchResponse = await fetch(`/api/posts?userId=${user.nickname}&friendId=${selectedFriend}`)
                     const fetchResult = await fetchResponse.json()

                     if (fetchResult.success) {
                        const updatedPostData = fetchResult.posts.find((post: any) => post.id === updatedPost.id)
                        if (updatedPostData) {
                           // 실제 데이터베이스에서 가져온 최신 데이터로 업데이트
                           const actualImageUrl = updatedPostData.image_url || ''

                           // 게시물 목록에서 수정된 게시물 업데이트
                           setMyPosts((prev) =>
                              prev.map((post) =>
                                 post.id === updatedPost.id
                                    ? {
                                         ...post,
                                         content: updatedPostData.content,
                                         imageUrl: actualImageUrl,
                                      }
                                    : post
                              )
                           )

                           // 홈화면에 수정 완료 이벤트 전송
                           if (typeof window !== 'undefined') {
                              window.dispatchEvent(
                                 new CustomEvent('post:updated', {
                                    detail: {
                                       postId: updatedPost.id,
                                       content: updatedPostData.content,
                                       imageUrl: actualImageUrl,
                                    },
                                 })
                              )
                           }
                        }
                     }
                  }
               } catch (fetchError) {
                  console.error('수정된 포스트 조회 오류:', fetchError)
                  // 조회 실패 시 기존 방식으로 폴백
                  setMyPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? { ...post, content: updatedPost.content, imageUrl: updatedPost.imageUrl } : post)))

                  if (typeof window !== 'undefined') {
                     window.dispatchEvent(
                        new CustomEvent('post:updated', {
                           detail: {
                              postId: updatedPost.id,
                              content: updatedPost.content,
                              imageUrl: updatedPost.imageUrl,
                           },
                        })
                     )
                  }
               }

               handleCloseEditModal()
            }
         }
      } catch (error) {
         console.error('게시물 수정 오류:', error)
      }
   }

   const handleDeletePost = async (postId: number) => {
      try {
         console.log('=== 포스트 삭제 시작 ===')
         console.log('삭제할 포스트 ID:', postId)

         // 사용자 확인
         if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
            console.log('사용자가 삭제를 취소했습니다.')
            return
         }

         const userNickname = localStorage.getItem('user_nickname')
         const userId = localStorage.getItem('user_id')
         if (!userNickname || !userId) return

         console.log('삭제 요청 사용자 ID:', userId)

         // API 호출하여 포스트 삭제
         const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
               'x-user-id': userId,
            },
         })

         const result = await response.json()
         console.log('삭제 API 응답:', result)

         if (result.success) {
            console.log('포스트 삭제 성공!')
            // 게시물 목록에서 삭제된 게시물 제거
            setMyPosts((prev) => prev.filter((post) => post.id !== postId))

            // 홈화면에 삭제 완료 이벤트 전송
            if (typeof window !== 'undefined') {
               window.dispatchEvent(
                  new CustomEvent('post:deleted', {
                     detail: {
                        postId: postId,
                     },
                  })
               )
            }
         } else {
            console.error('포스트 삭제 실패:', result.error)
            alert('게시글 삭제에 실패했습니다: ' + result.error)
         }
      } catch (error) {
         console.error('포스트 삭제 오류:', error)
         alert('게시글 삭제 중 오류가 발생했습니다.')
      }
   }

   if (!isOpen) return null

   return (
      <>
         <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
               <ModalHeader>
                  <ModalTitle>{selectedFriend ? '내가 쓴 글' : '내가 쓴 글 보기'}</ModalTitle>
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
                     // 내가 쓴 글 목록 화면
                     <>
                        <BackButton onClick={handleBackToList}>← 친구 목록으로</BackButton>
                        {postsLoading ? (
                           <EmptyText>글을 불러오는 중...</EmptyText>
                        ) : myPosts.length === 0 ? (
                           <EmptyText>해당 친구와의 피드에 쓴 글이 없습니다.</EmptyText>
                        ) : (
                           <PostsList>
                              {myPosts.map((post) => (
                                 <PostCard key={post.id}>
                                    <PostHeader>
                                       <span>{post.nickname}</span>
                                       <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                                       <span>{new Date(post.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </PostHeader>
                                    {post.image_url && (
                                       <PostImage
                                          style={{
                                             backgroundImage: `url('${post.image_url}')`,
                                             backgroundSize: 'cover',
                                             backgroundPosition: 'center',
                                             backgroundRepeat: 'no-repeat',
                                          }}
                                       />
                                    )}
                                    <PostBody>{post.content}</PostBody>
                                    <PostActions>
                                       <div style={{ width: '40px' }}></div>
                                       <a
                                          onClick={() => handleBookmarkPost(post.id)}
                                          style={{
                                             cursor: 'pointer',
                                             color: post.isBookmarked ? '#10b981' : '#4b5563',
                                             fontWeight: post.isBookmarked ? '600' : '400',
                                          }}
                                       >
                                          {post.isBookmarked ? '책갈피' : '책갈피'}
                                       </a>
                                       <a onClick={() => handleOpenCommentModal(post.id, post.content)} style={{ cursor: 'pointer' }}>
                                          댓글
                                       </a>
                                       <a onClick={() => handleDeletePost(post.id)} style={{ cursor: 'pointer' }}>
                                          삭제
                                       </a>
                                       <a onClick={() => handleEditPost(post)} style={{ cursor: 'pointer' }}>
                                          수정
                                       </a>
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

         {/* 댓글 모달 */}
         <CommentModal isOpen={isCommentModalOpen} onClose={handleCloseCommentModal} postId={selectedPostForComment?.id || 0} postContent={selectedPostForComment?.content || ''} />

         {/* 수정 모달 */}
         <PostModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            mode="edit"
            initialData={editingPost}
            onSubmit={() => {}}
            onUpdate={(id, postData) => {
               handleUpdatePost({
                  id,
                  content: postData.content,
                  imageUrl: postData.imageFile ? URL.createObjectURL(postData.imageFile) : editingPost?.image_url || editingPost?.imageUrl || '',
               })
            }}
            connections={connections}
         />
      </>
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
   grid-template-rows: auto auto 1fr;
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

const PostImage = styled.div`
   margin: 12px 0;
   width: 100%;
   aspect-ratio: 5/3;
   background-size: cover;
   background-position: 50% 50%;
`

const PostBody = styled.div`
   font-size: 13px;
   line-height: 1.5;
   padding: 0 16px 16px;
   color: #111827;
`

const PostActions = styled.div`
   display: flex;
   gap: 20px;
   padding: 16px;
   border-top: 1px solid #e5e7eb;
   font-size: 14px;
   color: #4b5563;

   a {
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
         color: #1f2937;
      }
   }
`
