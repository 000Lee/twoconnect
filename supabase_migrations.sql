-- post_checks 테이블 생성
-- 사용자가 게시물을 읽었는지 체크하는 테이블

CREATE TABLE IF NOT EXISTS public.post_checks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    checked BOOLEAN NOT NULL DEFAULT true,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 한 사용자가 한 게시물에 대해 하나의 체크만 가질 수 있음
    UNIQUE(user_id, post_id)
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_post_checks_user_id ON public.post_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_checks_post_id ON public.post_checks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_checks_checked ON public.post_checks(checked);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.post_checks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 체크 기록만 볼 수 있음
CREATE POLICY "Users can view their own post checks" ON public.post_checks
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- 사용자는 자신의 체크 기록만 생성/수정할 수 있음
CREATE POLICY "Users can insert their own post checks" ON public.post_checks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own post checks" ON public.post_checks
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 사용자는 자신의 체크 기록만 삭제할 수 있음
CREATE POLICY "Users can delete their own post checks" ON public.post_checks
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 함수 생성: 게시물 체크 상태 확인
CREATE OR REPLACE FUNCTION get_unread_posts_count(
    p_current_user_id UUID,
    p_friend_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_posts INTEGER;
    checked_posts INTEGER;
BEGIN
    -- 친구의 총 게시물 수 (본인 게시물 제외)
    SELECT COUNT(*) INTO total_posts
    FROM public.posts
    WHERE user_id = p_friend_id
    AND user_id != p_current_user_id;
    
    -- 체크된 게시물 수
    SELECT COUNT(*) INTO checked_posts
    FROM public.post_checks pc
    JOIN public.posts p ON pc.post_id = p.id
    WHERE pc.user_id = p_current_user_id
    AND p.user_id = p_friend_id
    AND pc.checked = true;
    
    -- 읽지 않은 게시물 수 반환
    RETURN GREATEST(0, total_posts - checked_posts);
END;
$$;

-- 함수에 대한 권한 설정
GRANT EXECUTE ON FUNCTION get_unread_posts_count(UUID, UUID) TO authenticated;

