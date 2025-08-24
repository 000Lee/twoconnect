'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

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
	const [connections, setConnections] = useState<ConnectionItem[]>([])
	const [loading, setLoading] = useState(false)
	const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
	const [myPosts, setMyPosts] = useState<any[]>([])
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
				// 내가 쓴 글만 필터링
				const onlyMine = result.posts.filter((post: any) => post.nickname === nickname)
				setMyPosts(onlyMine)
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

	if (!isOpen) return null

	return (
		<ModalOverlay onClick={onClose}>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				<ModalHeader>
					<ModalTitle>
						{selectedFriend ? '내가 쓴 글' : '내가 쓴 글 보기'}
					</ModalTitle>
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
														backgroundRepeat: 'no-repeat'
													}} 
												/>
											)}
											<PostBody>{post.content}</PostBody>
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


