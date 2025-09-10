'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import CommentModal from './CommentModal'
import PostModal from './PostModal'

interface BookmarkModalProps {
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

interface AuthorItem {
   nickname: string
   userId: string
}

interface Post {
   id: number
   content: string
   image_url?: string
   created_at: string
   user_id: string
   nickname: string
   isChecked?: boolean
   isBookmarked?: boolean
}

export default function BookmarkModal({ isOpen, onClose }: BookmarkModalProps) {
   const [connections, setConnections] = useState<ConnectionItem[]>([])
   const [authors, setAuthors] = useState<AuthorItem[]>([])
   const [loading, setLoading] = useState(false)
   const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
   const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([])
   const [postsLoading, setPostsLoading] = useState(false)
   const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
   const [selectedPostForComment, setSelectedPostForComment] = useState<any>(null)
   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
   const [editingPost, setEditingPost] = useState<any>(null)

   useEffect(() => {
      if (!isOpen) return
      const nickname = localStorage.getItem('user_nickname')
      if (!nickname) return
      setLoading(true)

      // 연결된 친구 목록 가져오기
      fetch(`/api/connections?userId=${nickname}`)
         .then((res) => res.json())
         .then((result) => {
            if (result.success) {
               setConnections(result.connections || [])

               // 모든 친구들과의 피드에서 글 작성자 목록 추출
               const friendIds = result.connections?.map((conn: any) => conn.friend_id) || []
               const allFriendIds = [nickname, ...friendIds] // 본인 + 친구들

               // 각 친구와의 피드에서 게시글 조회하여 작성자 목록 생성
               Promise.all(
                  allFriendIds.map((friendId) =>
                     fetch(`/api/posts?userId=${nickname}&friendId=${friendId}`)
                        .then((res) => res.json())
                        .then((result) => (result.success ? result.posts : []))
                  )
               ).then((allPosts) => {
                  // 모든 게시글을 하나의 배열로 합치기
                  const flatPosts = allPosts.flat()

                  // 중복 제거 (같은 ID를 가진 게시글 제거)
                  const uniquePosts = flatPosts.reduce((acc: any[], post: any) => {
                     if (!acc.find((p) => p.id === post.id)) {
                        acc.push(post)
                     }
                     return acc
                  }, [])

                  // 고유한 작성자 목록 생성 (모든 작성자 포함)
                  const uniqueAuthors = Array.from(new Set(uniquePosts.map((post: any) => post.nickname))).map((nickname) => ({ nickname, userId: nickname }))

                  setAuthors(uniqueAuthors)
               })
            }
         })
         .finally(() => setLoading(false))
   }, [isOpen])

   const handleSelectAuthor = async (authorNickname: string) => {
      setSelectedAuthor(authorNickname)
      setPostsLoading(true)

      try {
         const nickname = localStorage.getItem('user_nickname')
         if (!nickname) return

         // 모든 친구들과의 피드에서 해당 작성자가 올린 글만 가져오기
         const friendIds = connections.map((conn) => conn.friend_id)
         const allFriendIds = [nickname, ...friendIds] // 본인 + 친구들

         // 각 친구와의 피드에서 게시글 조회
         const allPostsResponses = await Promise.all(
            allFriendIds.map((friendId) =>
               fetch(`/api/posts?userId=${nickname}&friendId=${friendId}`)
                  .then((res) => res.json())
                  .then((result) => (result.success ? result.posts : []))
            )
         )

         // 모든 게시글을 하나의 배열로 합치고 해당 작성자의 글만 필터링
         const allPosts = allPostsResponses.flat()

         // 중복 제거 (같은 ID를 가진 게시글 제거)
         const uniquePosts = allPosts.reduce((acc: any[], post: any) => {
            if (!acc.find((p) => p.id === post.id)) {
               acc.push(post)
            }
            return acc
         }, [])

         const authorPosts = uniquePosts.filter((post: any) => post.nickname === authorNickname)

         if (authorPosts.length > 0) {
            // 체크/책갈피 상태를 확인하여 책갈피된 게시물만 필터링
            const bookmarkedPostsWithStatus = await Promise.all(
               authorPosts.map(async (post: any) => {
                  // 체크 상태 조회
                  let isChecked = false
                  try {
                     const checkResponse = await fetch(`/api/posts/${post.id}/check`, {
                        headers: {
                           'x-user-nickname': nickname,
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
                  let isBookmarked = false
                  try {
                     const bookmarkResponse = await fetch(`/api/posts/${post.id}/bookmark`, {
                        headers: {
                           'x-user-nickname': nickname,
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

            // 책갈피된 게시물만 필터링
            const bookmarkedPosts = bookmarkedPostsWithStatus.filter((post: any) => post.isBookmarked)
            setBookmarkedPosts(bookmarkedPosts)
         } else {
            setBookmarkedPosts([])
         }
      } catch (error) {
         console.error('책갈피된 게시물 조회 오류:', error)
         setBookmarkedPosts([])
      } finally {
         setPostsLoading(false)
      }
   }

   const handlePostCheck = async (postId: number) => {
      try {
         console.log('=== 포스트 체크/해제 시작 ===')
         console.log('처리할 포스트 ID:', postId)

         const userNickname = localStorage.getItem('user_nickname')
         if (!userNickname) return

         const response = await fetch(`/api/posts/${postId}/check`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-user-nickname': userNickname,
            },
         })

         const result = await response.json()
         if (result.success) {
            console.log('포스트 체크/해제 성공!', result.action)

            // 체크 상태에 따라 게시글 상태 업데이트
            const newCheckedState = result.action === 'checked'

            setBookmarkedPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isChecked: newCheckedState } : post)))

            // 홈화면에 체크 완료 이벤트 전송
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

         const userNickname = localStorage.getItem('user_nickname')
         if (!userNickname) return

         const response = await fetch(`/api/posts/${postId}/bookmark`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-user-nickname': userNickname,
            },
         })

         const result = await response.json()
         if (result.success) {
            console.log('포스트 책갈피/해제 성공!', result.action)

            // 책갈피 상태에 따라 게시글 상태 업데이트
            const newBookmarkedState = result.action === 'bookmarked'

            setBookmarkedPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isBookmarked: newBookmarkedState } : post)))

            // 홈화면에 책갈피 완료 이벤트 전송
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

            // 책갈피 해제된 게시물은 목록에서 제거
            if (!newBookmarkedState) {
               setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId))
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

   const handleOpenCommentModal = (postId: number, postContent: string) => {
      setSelectedPostForComment({ id: postId, content: postContent })
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
         const userNickname = localStorage.getItem('user_nickname')
         const userId = localStorage.getItem('user_id')
         if (!userNickname || !userId) return

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
                  const userNickname = localStorage.getItem('user_nickname')
                  if (userNickname) {
                     const friendIds = connections.map((conn) => conn.friend_id)
                     const allFriendIds = [userNickname, ...friendIds]

                     const allPostsResponses = await Promise.all(
                        allFriendIds.map((friendId) =>
                           fetch(`/api/posts?userId=${userNickname}&friendId=${friendId}`)
                              .then((res) => res.json())
                              .then((result) => (result.success ? result.posts : []))
                        )
                     )

                     const allPosts = allPostsResponses.flat()
                     const uniquePosts = allPosts.reduce((acc: any[], post: any) => {
                        if (!acc.find((p) => p.id === post.id)) {
                           acc.push(post)
                        }
                        return acc
                     }, [])

                     const authorPosts = uniquePosts.filter((post: any) => post.nickname === userNickname)

                     if (authorPosts.length > 0) {
                        const bookmarkedPostsWithStatus = await Promise.all(
                           authorPosts.map(async (post: any) => {
                              let isChecked = false
                              let isBookmarked = false

                              try {
                                 const checkResponse = await fetch(`/api/posts/${post.id}/check`, {
                                    headers: { 'x-user-nickname': userNickname },
                                 })
                                 const checkResult = await checkResponse.json()
                                 if (checkResult.success) isChecked = checkResult.isChecked
                              } catch (error) {
                                 console.error('체크 상태 조회 오류:', error)
                              }

                              try {
                                 const bookmarkResponse = await fetch(`/api/posts/${post.id}/bookmark`, {
                                    headers: { 'x-user-nickname': userNickname },
                                 })
                                 const bookmarkResult = await bookmarkResponse.json()
                                 if (bookmarkResult.success) isBookmarked = bookmarkResult.isBookmarked
                              } catch (error) {
                                 console.error('책갈피 상태 조회 오류:', error)
                              }

                              return { ...post, isChecked, isBookmarked }
                           })
                        )

                        const bookmarkedPosts = bookmarkedPostsWithStatus.filter((post: any) => post.isBookmarked)
                        setBookmarkedPosts(bookmarkedPosts)
                     }
                  }
               } catch (fetchError) {
                  console.error('수정된 포스트 조회 오류:', fetchError)
               }

               // 홈화면에 수정 완료 이벤트 전송
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

         if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
            console.log('사용자가 삭제를 취소했습니다.')
            return
         }

         const userNickname = localStorage.getItem('user_nickname')
         const userId = localStorage.getItem('user_id')
         if (!userNickname || !userId) return

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
            setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId))

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

   const handleBackToList = () => {
      setSelectedAuthor(null)
      setBookmarkedPosts([])
   }

   if (!isOpen) return null

   return (
      <>
         <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
               <ModalHeader>
                  <ModalTitle>{selectedAuthor ? '책갈피된 게시물' : '글 작성자 선택'}</ModalTitle>
                  <CloseButton onClick={onClose}>&times;</CloseButton>
               </ModalHeader>
               <ModalBody>
                  {!selectedAuthor ? (
                     // 글 작성자 목록 화면
                     <>
                        {loading ? (
                           <EmptyText>불러오는 중...</EmptyText>
                        ) : authors.length === 0 ? (
                           <EmptyText>글을 작성한 사용자가 없습니다.</EmptyText>
                        ) : (
                           <List>
                              {authors.map((author) => (
                                 <ListItem key={author.userId} onClick={() => handleSelectAuthor(author.nickname)}>
                                    {author.nickname}
                                 </ListItem>
                              ))}
                           </List>
                        )}
                     </>
                  ) : (
                     // 책갈피된 게시물 목록 화면
                     <>
                        <BackButton onClick={handleBackToList}>← 작성자 목록으로</BackButton>
                        {postsLoading ? (
                           <EmptyText>게시물을 불러오는 중...</EmptyText>
                        ) : bookmarkedPosts.length === 0 ? (
                           <EmptyText>{selectedAuthor}님이 작성한 책갈피된 게시물이 없습니다.</EmptyText>
                        ) : (
                           <PostsList>
                              {bookmarkedPosts.map((post) => (
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
                                       <a
                                          onClick={() => handlePostCheck(post.id)}
                                          style={{
                                             opacity: post.nickname === localStorage.getItem('user_nickname') ? 0 : 1,
                                             cursor: post.nickname === localStorage.getItem('user_nickname') ? 'default' : 'pointer',
                                             color: post.isChecked ? '#6c5ce7' : '#4b5563',
                                             fontWeight: post.isChecked ? '600' : '400',
                                          }}
                                       >
                                          {post.isChecked ? '체크' : '체크'}
                                       </a>
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
                                       {post.nickname === localStorage.getItem('user_nickname') && (
                                          <>
                                             <a onClick={() => handleDeletePost(post.id)} style={{ cursor: 'pointer' }}>
                                                삭제
                                             </a>
                                             <a onClick={() => handleEditPost(post)} style={{ cursor: 'pointer' }}>
                                                수정
                                             </a>
                                          </>
                                       )}
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
   grid-template-rows: auto auto 1fr auto;
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
   gap: 24px;
   font-size: 13px;
   padding: 12px 16px 16px;
   color: #4b5563;

   a {
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
         color: #1f2937;
      }
   }
`
