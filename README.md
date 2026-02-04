# TwoConnect

> 가장 가까운 사람들과만 나누는 진짜 이야기, 1:1 프라이빗 SNS

## 📌 프로젝트 소개

TwoConnect는 불특정 다수가 보는 기존 SNS의 부담감에서 벗어나, **최대 10명의 소중한 친구들과 각각 독립된 공간에서 소통할 수 있는 프라이빗 SNS 플랫폼**입니다.

각 친구와의 관계마다 별도의 피드가 생성되어, 그 친구와 나만의 이야기를 쌓아갈 수 있습니다. 사진, 글, 감정 모두 오직 둘만의 공간에 남길 수 있어 더욱 깊고 진정성 있는 소통이 가능합니다.

### 주요 특징

- **1:1 프라이빗 피드**: 친구별로 독립된 피드 공간 제공
- **소수 연결 중심**: 최대 10명의 친구와만 연결되는 미니멀한 관계
- **직관적인 UX**: 친구 선택만으로 해당 친구와의 피드로 즉시 전환
- **읽음 확인 시스템**: 게시물 체크 기능으로 소통 상태 파악

---
## 🔗 배포 링크

**[Live Demo](https://twoconnect.vercel.app/)**
---
## 🛠 기술 스택

### Frontend
| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **Next.js** | 16 (App Router) | 서버 컴포넌트, API Routes, 최적화된 이미지 처리 등 풀스택 개발에 적합 |
| **React** | 19 | 최신 Concurrent Features 활용, 향상된 서버 컴포넌트 지원 |
| **TypeScript** | 5 | 타입 안정성 확보 및 개발 생산성 향상 |
| **styled-components** | 6 | CSS-in-JS를 통한 컴포넌트 기반 스타일링 |
| **SWR** | 2.3 | 클라이언트 데이터 페칭, 캐싱, 낙관적 업데이트 구현 |

### Backend & Database
| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL 기반 BaaS - 인증, 데이터베이스, 스토리지 통합 솔루션 |
| **Row Level Security (RLS)** | 데이터베이스 레벨의 보안 정책 적용 |

### Deployment
| 기술 | 용도 |
|------|------|
| **Vercel** | Next.js 최적화 배포 환경, 자동 CI/CD |

---

## 📁 프로젝트 구조

```
twoconnect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── admin/        # 관리자 API
│   │   │   ├── auth/         # 인증 관련 API
│   │   │   ├── comments/     # 댓글 CRUD API
│   │   │   ├── connections/  # 친구 관계 관리 API
│   │   │   ├── cron/         # 스케줄 작업
│   │   │   ├── notices/      # 공지사항 API
│   │   │   └── posts/        # 게시물 CRUD API
│   │   ├── auth/             # 인증 페이지
│   │   ├── login/            # 로그인 페이지
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   └── page.tsx          # 메인 피드 페이지
│   │
│   ├── components/            # React 컴포넌트
│   │   ├── AdminModal.tsx         # 관리자 모달
│   │   ├── AppHeader.tsx          # 글로벌 헤더
│   │   ├── BookmarkModal.tsx      # 책갈피 모달
│   │   ├── CommentModal.tsx       # 댓글 모달
│   │   ├── FriendAddModal.tsx     # 친구 추가 모달
│   │   ├── FriendManagementModal.tsx  # 친구 관리 모달
│   │   ├── FriendRequestModal.tsx # 친구 요청 모달
│   │   ├── ImageViewerModal.tsx   # 이미지 뷰어
│   │   ├── MyPostsModal.tsx       # 내 게시물 모달
│   │   ├── NoticeModal.tsx        # 공지사항 모달
│   │   ├── PostCheckModal.tsx     # 게시물 체크 모달
│   │   ├── PostModal.tsx          # 게시물 작성/수정 모달
│   │   └── auth/                  # 인증 관련 컴포넌트
│   │
│   ├── contexts/              # React Context
│   │   └── AuthContext.tsx   # 인증 상태 관리
│   │
│   ├── hooks/                 # Custom Hooks
│   │   └── usePosts.ts       # 게시물 데이터 관리 (SWR)
│   │
│   ├── lib/                   # 유틸리티
│   │   ├── auth.ts           # 인증 헬퍼 함수
│   │   ├── fetcher.ts        # SWR fetcher
│   │   ├── jwt.ts            # JWT 처리
│   │   └── supabase.ts       # Supabase 클라이언트
│   │
│   ├── styled/                # 전역 스타일
│   │
│   └── types/                 # TypeScript 타입 정의
│       └── supabase.ts       # 데이터베이스 스키마 타입
│
├── public/                    # 정적 파일
├── scripts/                   # 빌드 스크립트
├── supabase_migrations.sql   # 데이터베이스 마이그레이션
└── vercel.json               # Vercel 배포 설정
```

---

## 🗄 데이터베이스 스키마

### ERD 개요

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    users    │────<│   connections    │>────│    users    │
│             │     │                  │     │  (friend)   │
├─────────────┤     ├──────────────────┤     └─────────────┘
│ id (PK)     │     │ id (PK)          │
│ email       │     │ user_id1 (FK)    │
│ nickname    │     │ user_id2 (FK)    │
│ password    │     │ status           │
│ created_at  │     │ created_at       │
└─────────────┘     └──────────────────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌──────────────────┐
│    posts    │    │  comments   │    │  post_bookmarks  │
├─────────────┤    ├─────────────┤    ├──────────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)          │
│ user_id (FK)│    │ user_id (FK)│    │ user_id (FK)     │
│ nickname    │    │ post_id (FK)│    │ post_id (FK)     │
│ content     │    │ content     │    │ created_at       │
│ image_url   │    │ created_at  │    └──────────────────┘
│ created_at  │    └─────────────┘
└─────────────┘

┌─────────────┐
│   notices   │
├─────────────┤
│ id (PK)     │
│ title       │
│ content     │
│ created_at  │
└─────────────┘
```

### 주요 테이블

| 테이블명 | 설명 |
|----------|------|
| `users` | 사용자 정보 (이메일, 닉네임, 암호화된 비밀번호) |
| `posts` | 게시물 정보 (작성자, 내용, 이미지 URL) |
| `connections` | 친구 관계 (요청자, 수신자, 연결 상태) |
| `comments` | 댓글 정보 (작성자, 게시물, 내용) |
| `post_bookmarks` | 게시물 책갈피 (사용자별 저장한 게시물) |
| `notices` | 공지사항 (관리자 작성 공지) |

### 보안 정책 (Row Level Security)

모든 테이블에 RLS를 적용하여 데이터베이스 레벨에서 접근 제어를 구현하였습니다.

| 테이블 | 정책명 | 권한 | 설명 |
|--------|--------|------|------|
| `users` | Users can insert during signup | INSERT | 회원가입 시 사용자 생성 허용 |
| `users` | Users can view own profile (JWT) | SELECT | 본인 프로필만 조회 가능 |
| `users` | Users can update own profile (JWT) | UPDATE | 본인 프로필만 수정 가능 |
| `posts` | Users can view their own and connected posts | SELECT | 본인 및 친구 게시물만 조회 |
| `posts` | Authenticated users can create posts | INSERT | 인증된 사용자만 작성 가능 |
| `posts` | Users can update their own posts | UPDATE | 본인 게시물만 수정 가능 |
| `posts` | Users can delete their own posts | DELETE | 본인 게시물만 삭제 가능 |
| `comments` | Allow public read access | SELECT | 댓글 공개 조회 |
| `comments` | Allow authenticated users to insert | INSERT | 인증된 사용자만 작성 가능 |
| `comments` | Allow users to delete own comments | DELETE | 본인 댓글만 삭제 가능 |
| `connections` | Users can view their own connections | SELECT | 본인 연결만 조회 가능 |
| `connections` | Users can manage their own connections | ALL | 본인 연결만 관리 가능 |
| `post_bookmarks` | Users can view their own post bookmarks | SELECT | 본인 책갈피만 조회 가능 |
| `post_bookmarks` | Users can insert/delete their own post bookmarks | ALL | 본인 책갈피만 관리 가능 |
| `notices` | 공지사항 조회 허용 | SELECT | 모든 사용자 조회 가능 |
| `notices` | Admin만 공지사항 생성 (JWT) | INSERT | 관리자만 작성 가능 |
| `notices` | Admin만 공지사항 수정 (JWT) | UPDATE | 관리자만 수정 가능 |
| `notices` | Admin만 공지사항 삭제 (JWT) | DELETE | 관리자만 삭제 가능 |

---

## ✨ 주요 기능

### 1. 인증 시스템
- 이메일/비밀번호 기반 회원가입 및 로그인
- JWT 토큰 기반 세션 관리
- Context API를 활용한 전역 인증 상태 관리

### 2. 친구 연결 시스템
- 닉네임 기반 친구 검색 및 요청
- 친구 요청 수락/거절 기능
- 연결된 친구별 색상 구분 UI
- 최대 10명 제한으로 소수 관계 집중

### 3. 게시물 관리
- 텍스트 및 이미지 게시물 작성
- Base64 인코딩을 통한 이미지 업로드
- 게시물 수정 및 삭제 (작성자 본인만)
- 무한 스크롤 구현 (Intersection Observer)

### 4. 피드 시스템
- 친구 선택 시 해당 친구와의 피드로 전환
- SWR을 활용한 효율적인 데이터 캐싱
- 낙관적 업데이트(Optimistic Update)로 빠른 UX 제공

### 5. 상호작용 기능
- **체크(읽음 표시)**: 친구 게시물 확인 시 체크 표시
- **책갈피**: 중요한 게시물 저장
- **댓글**: 게시물에 댓글 작성

### 6. 공지사항
- 관리자 공지 작성/수정/삭제
- 사용자 공지 확인

---

## 🔧 설치 및 실행

### 사전 요구사항
- Node.js 18.x 이상
- npm 또는 yarn
- Supabase 계정 및 프로젝트

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수를 설정합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
```

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/000Lee/twoconnect.git
cd twoconnect

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

### 데이터베이스 설정

Supabase 대시보드에서 `supabase_migrations.sql` 파일의 SQL을 실행하여 필요한 테이블과 정책을 생성합니다.

---

## 📱 스크린샷

> 추후 서비스 스크린샷 추가 예정

---

## 🎯 개발 과정에서 고민한 점

### 1. 데이터 페칭 전략
- **문제**: 친구 전환 시마다 서버 요청이 발생하여 UX 저하
- **해결**: SWR을 도입하여 캐싱 및 백그라운드 리프레시 구현
- **결과**: 친구 간 피드 전환이 즉각적으로 이루어지는 UX 개선

### 2. 낙관적 업데이트
- **문제**: 게시물 체크/책갈피 시 서버 응답까지 UI 업데이트 지연
- **해결**: SWR의 mutate를 활용한 낙관적 업데이트 적용
- **결과**: 사용자 액션에 즉각적인 피드백 제공

### 3. 무한 스크롤 성능
- **문제**: 대량의 게시물 로드 시 성능 저하
- **해결**: Intersection Observer API로 뷰포트 진입 시에만 추가 로드
- **결과**: 초기 로드 최소화 및 스크롤 성능 개선

### 4. 보안
- **문제**: 민감한 사용자 데이터 보호 필요
- **해결**: Supabase RLS를 통한 데이터베이스 레벨 접근 제어
- **결과**: 사용자는 본인 데이터에만 접근 가능

---

## 🚀 향후 계획

- [ ] 친구 10명 초과했을때 테스트 및 조치
- [ ] 비밀번호 찾기
- [ ] 이미지 다중 업로드
- [ ] PWA 지원으로 모바일 앱 경험 제공


---

## 👨‍💻 개발자 정보

**이 프로젝트는 개인 포트폴리오 프로젝트입니다.**

웹 개발에 관심을 가지고 프론트엔드와 백엔드를 아우르는 풀스택 개발 역량을 쌓기 위해 진행하였습니다. 프로젝트를 통해 Next.js App Router, Supabase, TypeScript 등 최신 기술 스택을 학습하고 실제 서비스 수준의 애플리케이션을 구현해보는 경험을 쌓았습니다.

---

## 📄 라이선스

이 프로젝트는 개인 포트폴리오 목적으로 제작되었습니다.
