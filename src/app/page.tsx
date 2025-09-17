'use client'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAuth } from '@/contexts/AuthContext'
import PostModal from '@/components/PostModal'
import FriendAddModal from '../components/FriendAddModal'
import CommentModal from '../components/CommentModal'

// 색상 순서 정의 (최대 11명까지)
const CONNECTION_COLORS = ['#FFCDB8', '#FFE9C0', '#E5FFBC', '#D3FFEA', '#D3DFFF', '#E7DDFF', '#FFD9EE', '#EAD2A4', '#C3E38F', '#A6E8C8']

// 색상 인덱스 안전 적용 (색상 개수를 넘어가면 순환)
const getConnectionColor = (index: number) => CONNECTION_COLORS[index % CONNECTION_COLORS.length]

export default function Home() {
   const { user } = useAuth()
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [isFriendModalOpen, setIsFriendModalOpen] = useState(false)
   const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
   const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
   const [selectedPostForComment, setSelectedPostForComment] = useState<{ id: number; content: string } | null>(null)
   const [editingPost, setEditingPost] = useState<{
      id: number
      content: string
      imageUrl: string
   } | null>(null)
   const [posts, setPosts] = useState<
      Array<{
         id: number
         title: string
         content: string
         imageUrl: string
         date: string
         time: string
         isChecked?: boolean
         isBookmarked?: boolean
      }>
   >([])
   const [friendPosts, setFriendPosts] = useState<
      Array<{
         id: number
         title: string
         content: string
         imageUrl: string
         date: string
         time: string
         isChecked?: boolean
         isBookmarked?: boolean
      }>
   >([])
   const [connections, setConnections] = useState<
      Array<{
         connection_id: number
         friend_id: string
         friend_nickname: string
         connection_status: string
         created_at: string
      }>
   >([])
   const [selectedFriend, setSelectedFriend] = useState<string | null>(null)

   // fetchPosts 함수 정의
   const fetchPosts = async () => {
      try {
         // user가 없으면 데이터를 가져오지 않음
         if (!user) {
            console.log('사용자가 로그인되지 않음, fetchPosts 건너뜀')
            return
         }

         // 본인의 게시글만 가져오기
         const response = await fetch(`/api/posts?userId=${user.nickname}`)
         const result = await response.json()

         if (result.success) {
            console.log('받아온 포스트 데이터:', result.posts)

            // 데이터베이스 형식을 프론트엔드 형식으로 변환
            const formattedPosts = result.posts.map((post: any) => {
               console.log('포스트 이미지 URL:', post.image_url)

               return {
                  id: post.id,
                  title: post.nickname,
                  content: post.content,
                  imageUrl: post.image_url || 'https://picsum.photos/seed/default/800/480',
                  date: new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                  time: new Date(post.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                  isChecked: post.is_read || false,
                  isBookmarked: false, // 책갈피 기능은 아직 구현되지 않음
               }
            })

            console.log('변환된 포스트:', formattedPosts)
            setPosts(formattedPosts)
         }
      } catch (error) {
         console.error('포스트 조회 오류:', error)
      }
   }

   // 사용자 정보가 변경될 때마다 실행
   useEffect(() => {
      if (user) {
         fetchPosts()
         fetchConnections(user.nickname)
      }

      // 친구 연결 목록 갱신 이벤트 리스너
      const onConnectionsUpdated = () => {
         if (user) {
            fetchConnections(user.nickname)
         }
      }
      // '내가쓴글' 모달에서 친구 선택 시 이벤트 리스너
      const onMyPostsShow = (e: any) => {
         try {
            const friendIdFromEvent = e?.detail?.friendId as string | undefined
            if (!friendIdFromEvent) return
            setSelectedFriend(friendIdFromEvent)
            fetchMyPostsWithFriend(friendIdFromEvent)
         } catch {}
      }

      // MyPostsModal에서 게시글 수정 시 이벤트 리스너
      const onPostUpdated = (e: any) => {
         try {
            const { postId, content, imageUrl } = e?.detail || {}
            if (!postId) return

            // 홈화면의 posts 상태에서 해당 게시글 업데이트
            setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, content, imageUrl } : post)))
         } catch (error) {
            console.error('게시글 수정 이벤트 처리 오류:', error)
         }
      }

      // MyPostsModal에서 게시글 삭제 시 이벤트 리스너
      const onPostDeleted = (e: any) => {
         try {
            const { postId } = e?.detail || {}
            if (!postId) return

            // 홈화면의 posts 상태에서 해당 게시글 제거
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
         } catch (error) {
            console.error('게시글 삭제 이벤트 처리 오류:', error)
         }
      }

      // PostCheckModal에서 게시글 체크 시 이벤트 리스너
      const onPostChecked = (e: any) => {
         try {
            const { postId, isChecked } = e?.detail || {}
            if (!postId) return

            // 홈화면의 posts 상태에서 해당 게시글 체크 상태 업데이트
            setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isChecked } : post)))
         } catch (error) {
            console.error('게시글 체크 이벤트 처리 오류:', error)
         }
      }

      // PostCheckModal에서 게시글 책갈피 시 이벤트 리스너
      const onPostBookmarked = (e: any) => {
         try {
            const { postId, isBookmarked } = e?.detail || {}
            if (!postId) return

            // 홈화면의 posts 상태에서 해당 게시글 책갈피 상태 업데이트
            setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isBookmarked } : post)))
         } catch (error) {
            console.error('게시글 책갈피 이벤트 처리 오류:', error)
         }
      }

      if (typeof window !== 'undefined') {
         window.addEventListener('connections:updated', onConnectionsUpdated)
         window.addEventListener('myposts:show', onMyPostsShow as EventListener)
         window.addEventListener('post:updated', onPostUpdated as EventListener)
         window.addEventListener('post:deleted', onPostDeleted as EventListener)
         window.addEventListener('post:checked', onPostChecked as EventListener)
         window.addEventListener('post:bookmarked', onPostBookmarked as EventListener)
      }
      return () => {
         if (typeof window !== 'undefined') {
            window.removeEventListener('connections:updated', onConnectionsUpdated)
            window.removeEventListener('myposts:show', onMyPostsShow as EventListener)
            window.removeEventListener('post:updated', onPostUpdated as EventListener)
            window.removeEventListener('post:deleted', onPostDeleted as EventListener)
            window.removeEventListener('post:checked', onPostChecked as EventListener)
            window.removeEventListener('post:bookmarked', onPostBookmarked as EventListener)
         }
      }
   }, [user]) // user가 변경될 때마다 useEffect 실행

   const fetchConnections = async (userId: string) => {
      try {
         console.log('fetchConnections 호출됨, userId:', userId)
         const response = await fetch(`/api/connections?userId=${userId}`)
         const result = await response.json()

         console.log('API 응답:', result)

         if (result.success) {
            console.log('연결된 친구들:', result.connections)
            setConnections(result.connections)
         } else {
            console.error('API 응답 실패:', result.error)
         }
      } catch (error) {
         console.error('친구 연결 조회 오류:', error)
      }
   }

   const handleFriendSelect = (friendId: string | null) => {
      setSelectedFriend(friendId)
      // 선택된 친구와의 피드 로드
      if (friendId) {
         fetchFriendPosts(friendId)
      } else {
         // 본인의 피드로 돌아가기
         fetchPosts()
      }
   }

   const fetchFriendPosts = async (friendId: string) => {
      try {
         // 선택된 친구와 본인의 게시글만 가져오기
         const response = await fetch(`/api/posts?userId=${user?.nickname}&friendId=${friendId}`)
         const result = await response.json()

         if (result.success) {
            // 체크/책갈피 상태도 함께 조회
            const formattedPosts = await Promise.all(
               result.posts.map(async (post: any) => {
                  // 체크 상태 조회
                  let isChecked = false
                  try {
                     const checkResponse = await fetch(`/api/posts/${post.id}/check`, {
                        headers: {
                           'x-user-nickname': user?.nickname || '',
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
                           'x-user-nickname': user?.nickname || '',
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
                     id: post.id,
                     title: post.nickname,
                     content: post.content,
                     imageUrl: post.image_url || 'https://picsum.photos/seed/default/800/480',
                     date: new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                     time: new Date(post.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                     isChecked,
                     isBookmarked,
                  }
               })
            )

            setPosts(formattedPosts)
         }
      } catch (error) {
         console.error('친구 피드 조회 오류:', error)
      }
   }

   // 특정 친구와의 피드에서 "내가 쓴 글"만 조회
   const fetchMyPostsWithFriend = async (friendId: string) => {
      try {
         const response = await fetch(`/api/posts?userId=${user?.nickname}&friendId=${friendId}`)
         const result = await response.json()
         if (result.success) {
            const onlyMine = result.posts.filter((post: any) => post.nickname === user?.nickname)

            // 체크/책갈피 상태도 함께 조회
            const formattedPosts = onlyMine.map((post: any) => {
               return {
                  id: post.id,
                  title: post.nickname,
                  content: post.content,
                  imageUrl: post.image_url || 'https://picsum.photos/seed/default/800/480',
                  date: new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                  time: new Date(post.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                  isChecked: post.is_read || false,
                  isBookmarked: false, // 책갈피 기능은 아직 구현되지 않음
               }
            })

            setPosts(formattedPosts)
         }
      } catch (error) {
         console.error('내가쓴글(친구별) 조회 오류:', error)
      }
   }

   const handleCreatePost = async (postData: { content: string; imageFile: File | null; selectedFriendId?: string }) => {
      try {
         console.log('=== 포스트 생성 시작 ===')
         console.log('받은 postData:', postData)

         // state에서 사용자 정보 가져오기
         console.log('사용자 정보:', { userNickname: user?.nickname, userId: user?.id })

         // 이미지 파일을 Base64로 변환
         let imageData = null
         if (postData.imageFile) {
            console.log('이미지 파일 처리 시작:', postData.imageFile.name)
            const reader = new FileReader()
            imageData = await new Promise((resolve) => {
               reader.onload = (e) => {
                  const result = e.target?.result as string
                  console.log('Base64 변환 완료, 길이:', result.length)
                  resolve({
                     name: postData.imageFile!.name,
                     type: postData.imageFile!.type,
                     size: postData.imageFile!.size,
                     data: result,
                  })
               }
               reader.onerror = (error) => {
                  console.error('FileReader 오류:', error)
                  resolve(null)
               }
               reader.readAsDataURL(postData.imageFile!)
            })
            console.log('이미지 데이터 준비 완료:', !!imageData)
         } else {
            console.log('이미지 파일 없음')
         }

         // API 호출하여 데이터베이스에 저장
         const requestBody = {
            content: postData.content,
            imageFile: imageData,
            selectedFriendId: postData.selectedFriendId || null,
         }
         console.log('API 요청 본문:', requestBody)

         const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-user-nickname': user?.nickname || '',
               'x-user-id': user?.id || '',
            },
            body: JSON.stringify(requestBody),
         })

         const result = await response.json()
         console.log('API 응답:', result)

         if (result.success) {
            console.log('포스트 생성 성공!')
            // 성공 시 포스트 목록 새로고침
            if (postData.selectedFriendId) {
               // 친구와의 피드에 작성한 경우 해당 피드 새로고침
               fetchFriendPosts(postData.selectedFriendId)
            } else {
               // 본인 피드에 작성한 경우 본인 피드 새로고침
               fetchPosts()
            }
         } else {
            console.error('포스트 생성 실패:', result.error)
         }
      } catch (error) {
         console.error('포스트 생성 오류:', error)
      }
   }

   const handleUpdatePost = async (id: number, postData: { content: string; imageFile: File | null }) => {
      try {
         console.log('=== 포스트 수정 시작 ===')
         console.log('수정할 포스트 ID:', id)
         console.log('받은 postData:', postData)

         // state에서 사용자 정보 가져오기

         // 이미지 파일을 Base64로 변환
         let imageData = null
         if (postData.imageFile) {
            console.log('이미지 파일 처리 시작:', postData.imageFile.name)
            const reader = new FileReader()
            imageData = await new Promise((resolve) => {
               reader.onload = (e) => {
                  const result = e.target?.result as string
                  console.log('Base64 변환 완료, 길이:', result.length)
                  resolve({
                     name: postData.imageFile!.name,
                     type: postData.imageFile!.type,
                     size: postData.imageFile!.size,
                     data: result,
                  })
               }
               reader.onerror = (error) => {
                  console.error('FileReader 오류:', error)
                  resolve(null)
               }
               reader.readAsDataURL(postData.imageFile!)
            })
            console.log('이미지 데이터 준비 완료:', !!imageData)
         } else {
            console.log('이미지 파일 없음')
         }

         // API 호출하여 데이터베이스에서 수정
         const requestBody = {
            content: postData.content,
            imageFile: imageData,
         }
         console.log('API 요청 본문:', requestBody)

         const response = await fetch(`/api/posts/${id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'x-user-id': user?.id || '',
            },
            body: JSON.stringify(requestBody),
         })

         const result = await response.json()
         console.log('API 응답:', result)

         if (result.success) {
            console.log('포스트 수정 성공!')
            // 성공 시 포스트 목록 새로고침
            fetchPosts()
         } else {
            console.error('포스트 수정 실패:', result.error)
         }
      } catch (error) {
         console.error('포스트 수정 오류:', error)
      }
   }

   const handleEditPost = (post: { id: number; content: string; imageUrl: string }) => {
      setEditingPost(post)
      setModalMode('edit')
      setIsModalOpen(true)
   }

   const handleCloseModal = () => {
      setIsModalOpen(false)
      setModalMode('create')
      setEditingPost(null)
   }

   const handleOpenCommentModal = (postId: number, postContent: string) => {
      setSelectedPostForComment({ id: postId, content: postContent })
      setIsCommentModalOpen(true)
   }

   const handleCloseCommentModal = () => {
      setIsCommentModalOpen(false)
      setSelectedPostForComment(null)
   }

   const handleCheckPost = async (postId: number) => {
      try {
         console.log('=== 포스트 체크/해제 시작 ===')
         console.log('처리할 포스트 ID:', postId)

         const response = await fetch(`/api/posts/${postId}/check`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-user-nickname': user?.nickname || '',
            },
         })

         const result = await response.json()
         if (result.success) {
            console.log('포스트 체크/해제 성공!', result.action)

            // 체크 상태에 따라 게시글 상태 업데이트
            const newCheckedState = result.action === 'checked'

            setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isChecked: newCheckedState } : post)))

            // 선택된 친구의 게시글도 업데이트
            if (selectedFriend) {
               setFriendPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isChecked: newCheckedState } : post)))
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

         const response = await fetch(`/api/posts/${postId}/bookmark`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-user-nickname': user?.nickname || '',
            },
         })

         const result = await response.json()
         if (result.success) {
            console.log('포스트 책갈피/해제 성공!', result.action)

            // 책갈피 상태에 따라 게시글 상태 업데이트
            const newBookmarkedState = result.action === 'bookmarked'

            setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isBookmarked: newBookmarkedState } : post)))

            // 선택된 친구의 게시글도 업데이트
            if (selectedFriend) {
               setFriendPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, isBookmarked: newBookmarkedState } : post)))
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

   const handleDeletePost = async (postId: number) => {
      try {
         console.log('=== 포스트 삭제 시작 ===')
         console.log('삭제할 포스트 ID:', postId)

         // 사용자 확인
         if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
            console.log('사용자가 삭제를 취소했습니다.')
            return
         }

         console.log('삭제 요청 사용자 ID:', user?.id)

         // API 호출하여 포스트 삭제
         const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
               'x-user-id': user?.id || '',
            },
         })

         const result = await response.json()
         console.log('삭제 API 응답:', result)

         if (result.success) {
            console.log('포스트 삭제 성공!')
            // 성공 시 포스트 목록 새로고침
            fetchPosts()
         } else {
            console.error('포스트 삭제 실패:', result.error)
            alert('포스트 삭제에 실패했습니다: ' + result.error)
         }
      } catch (error) {
         console.error('포스트 삭제 오류:', error)
         alert('포스트 삭제 중 오류가 발생했습니다.')
      }
   }

   const handleAddFriend = async (nickname: string) => {
      try {
         console.log('=== 친구 추가 시작 ===')
         console.log('추가할 친구 닉네임:', nickname)

         if (!user) {
            throw new Error('로그인이 필요합니다.')
         }

         // API 호출하여 친구 연결 요청
         const response = await fetch('/api/connections', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'x-user-id': user?.id,
            },
            body: JSON.stringify({ friendNickname: nickname }),
         })

         const result = await response.json()
         console.log('친구 추가 API 응답:', result)

         if (result.success) {
            console.log('친구 추가 성공!')
            // 성공 시 친구 목록 새로고침
            fetchConnections(user?.nickname || '')
            alert('친구 연결 요청을 보냈습니다.')
         } else {
            console.error('친구 추가 실패:', result.error)
            throw new Error(result.error || '친구 추가에 실패했습니다.')
         }
      } catch (error) {
         console.error('친구 추가 오류:', error)
         throw error
      }
   }

   return (
      <Root>
         <Container>
            {/* 전역 헤더는 layout.tsx에서 렌더링됩니다 */}

            {/* decorative background behind content */}
            <BG aria-hidden>
               <BGPattern />
            </BG>

            <Safe>
               {/* 로그인된 상태일 때만 Header 표시 */}
               {user && (
                  <Header>
                     <Chip style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', fontWeight: '600' }}>Connected</Chip>
                     <Chips>
                        {/* 첫 번째 칩: 로그인한 사용자 */}
                        <Chip
                           key="current-user"
                           style={{
                              background: getConnectionColor(0),
                              border: '1px solid #e5e7eb',
                              fontWeight: '600',
                              cursor: 'pointer',
                           }}
                           onClick={() => handleFriendSelect(null)}
                        >
                           {user?.nickname}
                        </Chip>

                        {/* 연결된 친구들 */}
                        {connections.map((connection, index) => (
                           <Chip
                              key={connection.connection_id}
                              style={{
                                 background: getConnectionColor(index + 1),
                                 cursor: 'pointer',
                                 outline: selectedFriend === connection.friend_id ? '3px solid #000' : '1px solid transparent',
                                 zIndex: selectedFriend === connection.friend_id ? '10' : '1',
                                 fontWeight: selectedFriend === connection.friend_id ? '600' : '400',
                              }}
                              onClick={() => handleFriendSelect(connection.friend_id)}
                           >
                              {connection.friend_nickname}
                           </Chip>
                        ))}

                        {/* 마지막 칩: 친구추가 (최대 11명까지) */}
                        {connections.length < 10 && (
                           <Chip
                              key="add-friend"
                              style={{
                                 background: getConnectionColor(connections.length + 1),
                                 cursor: 'pointer',
                                 fontWeight: '600',
                              }}
                              onClick={() => setIsFriendModalOpen(true)}
                           >
                              친구추가
                           </Chip>
                        )}
                     </Chips>
                  </Header>
               )}

               {/* 로그인 안된 상태일 때 TwoConnect 소개 페이지 표시 */}
               {!user ? (
                  <IntroSection>
                     <IntroContent>
                        <IntroTitle>
                           가장 가까운 사람들과만 나누는 진짜 이야기, <strong>TwoConnect</strong>
                        </IntroTitle>
                        <IntroText>불특정 다수가 보는 SNS는 부담스럽고, 단둘이만 나누는 메신저는 어딘가 부족하다면?</IntroText>
                        <IntroText>
                           TwoConnect은 최대 6명의 친구와만 연결되어, 각자 따로 피드를 주고받을 수 있는 1:1 중심의 <strong>프라이빗 SNS</strong>입니다.
                        </IntroText>
                        <IntroText>친구별로 독립된 피드가 만들어져요.</IntroText>
                        <IntroText>각각의 공간에서 사진과 글을 공유하며, 관계의 결을 선명히 남길 수 있습니다.</IntroText>
                        <IntroText>사진도, 글도, 감정도 모두 그 친구와 나만의 공간에 남겨보세요.</IntroText>
                        <IntroText>
                           익숙하지만 새로운 방식으로, <strong>오직 소수와 깊게 연결되는 소셜 경험.</strong>
                        </IntroText>
                        <IntroText>TwoConnect에서 가장 가까운 사람들과 진짜 당신의 이야기를 나눠보세요.</IntroText>
                        <IntroButton onClick={() => (window.location.href = '/login')}>시작하기 →</IntroButton>
                     </IntroContent>
                  </IntroSection>
               ) : (
                  <>
                     {/* 로그인된 상태일 때 기존 포스트 목록 표시 */}
                     <List>
                        {posts.map((post) => (
                           <Card key={post.id}>
                              <CardHeader>
                                 <span>{post.title}</span>
                                 <span>{post.date}</span>
                                 <span>{post.time}</span>
                              </CardHeader>
                              <CardImage
                                 style={{
                                    backgroundImage: `url('${post.imageUrl}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                 }}
                              />
                              <CardBody>{post.content}</CardBody>
                              <CardActions>
                                 <a
                                    onClick={() => handleCheckPost(post.id)}
                                    style={{
                                       opacity: post.title === user?.nickname ? 0 : 1,
                                       cursor: post.title === user?.nickname ? 'default' : 'pointer',
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
                                 {post.title === user?.nickname && (
                                    <>
                                       <a onClick={() => handleDeletePost(post.id)} style={{ cursor: 'pointer' }}>
                                          삭제
                                       </a>
                                       <a onClick={() => handleEditPost(post)} style={{ cursor: 'pointer' }}>
                                          수정
                                       </a>
                                    </>
                                 )}
                              </CardActions>
                           </Card>
                        ))}
                     </List>
                  </>
               )}
            </Safe>

            <PostModal isOpen={isModalOpen} onClose={handleCloseModal} mode={modalMode} initialData={editingPost || undefined} onSubmit={handleCreatePost} onUpdate={handleUpdatePost} connections={connections} />

            <FriendAddModal isOpen={isFriendModalOpen} onClose={() => setIsFriendModalOpen(false)} onAddFriend={handleAddFriend} />

            <CommentModal isOpen={isCommentModalOpen} onClose={handleCloseCommentModal} postId={selectedPostForComment?.id || 0} postContent={selectedPostForComment?.content || ''} />

            {/* 로그인된 상태일 때만 글쓰기 버튼 표시 */}
            {user && (
               <Fab aria-label="새 글" onClick={() => setIsModalOpen(true)}>
                  <svg
                     viewBox="0 0 24 24"
                     aria-hidden="true"
                     focusable="false"
                     width="25"
                     height="25"
                     style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                        transition: 'transform 0.2s ease',
                     }}
                  >
                     <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
               </Fab>
            )}
         </Container>
      </Root>
   )
}

/* ========== styled ========== */
const Root = styled.div`
   min-height: 100dvh;
   background: var(--bg);
`
const Container = styled.div`
   position: relative;
   max-width: var(--container-max);
   margin: 0 auto;
   min-height: 100dvh;
`

/* 배경 레이어 */
const BG = styled.div`
   pointer-events: none;
   position: absolute;
   inset: 0;
   z-index: 0;
   overflow: hidden;
`
const BGPattern = styled.div`
   position: absolute;
   inset: 0;
   opacity: 0.8;

   /* 8px 세로/가로 라인 + 40px 굵은 라인으로 그래프 종이 느낌 */
   background-image:
      /* 굵은 라인 */ linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px), /* 얇은 라인 */ repeating-linear-gradient(to right, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 8px),
      repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 8px);
   background-size: 40px 40px, 40px 40px, /* 굵은 라인 간격 */ 8px 8px, 8px 8px; /* 얇은 라인 간격 */
   background-position: 0 0, 0 0, 0 0, 0 0;
`

/* 콘텐츠 레이어(안전 영역) */
const Safe = styled.div`
   position: relative;
   z-index: 1;
   padding-inline: var(--safe-x);
   //  padding-top: var(--safe-t);

   padding-bottom: clamp(60px, 6vw, 120px);
   display: grid;
   gap: 24px;
   & > :first-child {
      gap: 0px;
   }
`

const Header = styled.header`
   //  padding-top: 60px;
   display: grid;
   gap: 16px;
`
// 상단 헤더 바
// 전역 헤더는 컴포넌트로 분리됨

// 아래 타이틀(바로 아래 얇은 행)
const TitleRow = styled.div`
   height: 28px; /* 스샷처럼 낮은 라인 */
   display: flex;
   align-items: center;
`
const Title = styled.div`
   font-size: 14px; /* 스샷의 작은 'TwoConnect' */
   line-height: 1;
   color: #000;
`

const Chips = styled.div`
   display: flex;
   flex-wrap: wrap;
   //  gap: 8px;
   opacity: 0.8;
`
const Chip = styled.div`
   width: 120px;
   height: 40px;
   line-height: 40px;
   //  border: 1px solid #dcdcdc;
   background: #eee;
   //  border-radius: 8px;
   text-align: center;
   box-sizing: border-box;
`

const List = styled.div`
   display: grid;
   gap: 24px;
   grid-template-columns: 1fr;
   @media (min-width: 900px) {
      grid-template-columns: 1fr;
   }
`

const Card = styled.article`
   width: clamp(280px, 60vw, 560px);
   display: grid;
   grid-template-rows: auto auto 1fr auto;
   border: 1px solid #e5e7eb;
   border-radius: 12px;
   background: #fff;
   overflow: hidden;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`
const CardHeader = styled.div`
   display: flex;
   gap: 20px;
   font-size: 13px;
   padding: 16px 16px 0;
   color: #374151;
`
const CardImage = styled.div`
   margin: 12px 0;
   width: 100%;
   aspect-ratio: 5/3;
   background-size: cover;
   background-position: 50% 50%;
`
const CardBody = styled.div`
   font-size: 13px;
   line-height: 1.5;
   padding: 0 16px;
   color: #111827;
`
const CardActions = styled.div`
   display: flex;
   gap: 24px;
   font-size: 13px;
   padding: 12px 16px 16px;
   color: #4b5563;
`

const Fab = styled.button`
   position: fixed;
   right: var(--safe-x);
   bottom: var(--safe-x);
   width: 60px;
   height: 60px;
   border-radius: 50%;
   display: grid;
   place-items: center;
   font-size: 20px;
   color: white;
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   border: none;
   box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
   z-index: 100;
   cursor: pointer;
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   overflow: hidden;

   /* 호버 효과 */
   &:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5), 0 8px 15px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
   }

   /* 클릭 효과 */
   &:active {
      transform: translateY(-2px) scale(1.02);
      transition: all 0.1s ease;
   }

   /* 내부 빛나는 효과 */
   &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s;
   }

   &:hover::before {
      left: 100%;
   }

   /* 플로팅 애니메이션 */
   animation: float 3s ease-in-out infinite;

   @keyframes float {
      0%,
      100% {
         transform: translateY(0px);
      }
      50% {
         transform: translateY(-8px);
      }
   }

   /* 호버 시 플로팅 애니메이션 일시정지 */
   &:hover {
      animation-play-state: paused;
   }

   /* 호버 시 아이콘 회전 */
   &:hover svg {
      transform: rotate(90deg);
   }
`

const IntroSection = styled.section`
   padding: 60px 40px;
   text-align: center;
   background: white;
   border-radius: 16px;
   box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
   margin: 40px 20px;
   border: 1px solid #e5e7eb;
   position: relative;
   overflow: hidden;

   &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      z-index: -1;
   }
`

const IntroContent = styled.div`
   max-width: 1000px;
   margin: 0 auto;
   position: relative;
   z-index: 1;
`

const IntroTitle = styled.h2`
   font-size: 32px;
   color: #1e293b;
   margin-bottom: 40px;
   line-height: 1.3;
   font-weight: 700;

   strong {
      color: #6366f1;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
   }
`

const IntroText = styled.p`
   font-size: 18px;
   color: #475569;
   line-height: 1.7;
   margin-bottom: 20px;
   font-weight: 400;

   strong {
      color: #334155;
      font-weight: 600;
   }
`

const IntroButton = styled.button`
   background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
   color: white;
   padding: 16px 32px;
   border-radius: 12px;
   border: none;
   font-size: 18px;
   font-weight: 600;
   cursor: pointer;
   transition: all 0.3s ease;
   box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
   margin-top: 20px;

   &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
   }

   &:active {
      transform: translateY(0);
   }
`
