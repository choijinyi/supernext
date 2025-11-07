# supernext

블로그 체험단 매칭 플랫폼 SaaS

## 프로젝트 소개

광고주와 인플루언서를 연결하는 체험단 매칭 플랫폼입니다.

### 주요 기능

**인플루언서:**
- 🏠 체험단 목록 브라우징
- 📝 체험단 상세 정보 확인 및 지원
- 📊 내 지원 현황 추적 (신청완료/선정/반려)

**광고주:**
- ➕ 체험단 등록 및 관리
- 👥 신청자 목록 확인
- ✅ 체험단 선정 (일괄 선택)
- 🔒 모집 종료 기능

## 기술 스택

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript
- **Backend**: Hono + Supabase
- **UI**: shadcn-ui + TailwindCSS 4
- **State Management**: React Query + Zustand
- **Form**: React Hook Form + Zod
- **Utils**: date-fns, es-toolkit, ts-pattern

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- npm 또는 yarn
- Supabase 프로젝트

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 데이터베이스 마이그레이션

Supabase Dashboard → SQL Editor에서 다음 마이그레이션 파일을 실행하세요:

```bash
supabase/migrations/0002_create_blog_review_platform_schema.sql
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 프로젝트 구조

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 페이지
│   ├── advertiser/          # 광고주 전용 페이지
│   ├── campaigns/           # 체험단 페이지
│   └── my/                  # 사용자 페이지
├── backend/                 # 백엔드 레이어
│   ├── hono/               # Hono 앱 설정
│   ├── middleware/         # 미들웨어
│   └── http/               # HTTP 유틸리티
├── features/platform/       # 플랫폼 기능
│   ├── backend/            # API 라우터 & 서비스
│   ├── components/         # React 컴포넌트
│   └── hooks/              # React Query hooks
└── components/ui/           # shadcn-ui 컴포넌트
```

## 주요 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 홈 | `/` | 체험단 목록, 배너 |
| 회원가입 | `/signup` | 역할 선택 및 온보딩 |
| 체험단 상세 | `/campaigns/[id]` | 체험단 정보 및 지원 |
| 내 지원 목록 | `/my/applications` | 지원 현황 확인 |
| 체험단 관리 | `/advertiser/campaigns` | 광고주 대시보드 |
| 신청자 관리 | `/advertiser/campaigns/[id]` | 선정 및 모집 종료 |

## 데이터베이스 스키마

- `user_profiles` - 사용자 공통 정보
- `advertiser_profiles` - 광고주 전용 정보
- `influencer_profiles` - 인플루언서 SNS 정보
- `campaigns` - 체험단 정보
- `applications` - 지원 내역

## 라이선스

MIT

## 기여

이슈 및 Pull Request를 환영합니다!
