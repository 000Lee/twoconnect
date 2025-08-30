This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-  [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-  [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# TwoConnect

Next.js와 Supabase를 사용한 웹 애플리케이션입니다.

## Supabase 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성하세요
2. 프로젝트 설정에서 URL과 API 키를 복사하세요
3. 환경 변수에 실제 값을 입력하세요

### 3. 데이터베이스 스키마 정의

`src/types/supabase.ts` 파일에서 데이터베이스 테이블 스키마를 정의하세요.

## 사용법

```typescript
import { supabase } from '@/lib/supabase'

// 데이터 가져오기
const { data, error } = await supabase.from('table_name').select('*')

// 데이터 삽입
const { data, error } = await supabase.from('table_name').insert([{ column: 'value' }])
```

## 체크 기능

### 게시물 체크 시스템

-  사용자가 친구의 게시물을 읽었는지 체크하는 기능
-  `post_checks` 테이블을 통해 체크 상태 관리
-  헤더의 드롭다운 메뉴에서 "체크" 선택 시 모달 열림

### 주요 기능

1. **친구 목록 표시**: 연결된 친구들과 각각의 읽지 않은 게시물 수 표시
2. **게시물 목록**: 특정 친구를 선택하면 읽지 않은 게시물들 표시
3. **읽음 표시**: "읽음 표시" 버튼을 클릭하여 게시물을 읽음 처리
4. **실시간 업데이트**: 체크 후 즉시 목록에서 제거되고 카운트 감소

### 데이터베이스 구조

```sql
-- post_checks 테이블
CREATE TABLE post_checks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    post_id BIGINT REFERENCES posts(id),
    checked BOOLEAN DEFAULT true,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);
```
