import { useCallback } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

interface Post {
   id: number
   nickname: string
   content: string
   image_url: string | null
   created_at: string
   is_read?: boolean
   is_bookmarked?: boolean
}

interface PostsResponse {
   success: boolean
   posts: Post[]
}

interface FormattedPost {
   id: number
   title: string
   content: string
   imageUrl: string
   date: string
   time: string
   isChecked: boolean
   isBookmarked: boolean
}

export function usePosts(friendId: string | null, userNickname: string | null) {
   // userNickname이 없으면 요청하지 않음
   const shouldFetch = !!userNickname

   // API URL 생성
   const getUrl = () => {
      if (!shouldFetch) return null

      if (friendId) {
         return `/api/posts?friendId=${friendId}`
      }
      return '/api/posts'
   }

   const { data, error, mutate, isValidating, isLoading } = useSWR<PostsResponse>(getUrl(), fetcher, {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 2000,
   })

   // 포맷팅된 posts (최신순 정렬)
   const posts: FormattedPost[] = (data?.posts || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((post) => ({
         id: post.id,
         title: post.nickname,
         content: post.content,
         imageUrl: post.image_url || '',
         date: new Date(post.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
         }),
         time: new Date(post.created_at).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
         }),
         isChecked: post.is_read || false,
         isBookmarked: post.is_bookmarked || false,
      }))

   // 캐시 새로고침
   const refreshPosts = useCallback(() => {
      mutate()
   }, [mutate])

   // 로컬 상태 업데이트 (낙관적 업데이트용)
   const updatePost = useCallback(
      (postId: number, updates: Partial<{ is_read: boolean; is_bookmarked: boolean; content: string; image_url: string }>) => {
         mutate(
            (currentData) => {
               if (!currentData) return currentData
               return {
                  ...currentData,
                  posts: currentData.posts.map((post) => (post.id === postId ? { ...post, ...updates } : post)),
               }
            },
            { revalidate: false }
         )
      },
      [mutate]
   )

   // 게시글 삭제 (로컬 상태)
   const removePost = useCallback(
      (postId: number) => {
         mutate(
            (currentData) => {
               if (!currentData) return currentData
               return {
                  ...currentData,
                  posts: currentData.posts.filter((post) => post.id !== postId),
               }
            },
            { revalidate: false }
         )
      },
      [mutate]
   )

   return {
      posts,
      isLoading,
      isValidating,
      error,
      refreshPosts,
      updatePost,
      removePost,
      mutate,
   }
}
