# Dorandoran Community - Frontend
도란도란은 사람들이 모여 일상을 나누고 소통하는 커뮤니티 서비스입니다.
Node.js 기반 Express 서버를 통해 정적 페이지를 서빙하고 Spring Boot 백엔드와 REST API로 통신합니다.

## 주요 특징
### 심플하고 직관적인 UI
- 모바일 중심 레이아웃
- 헤더와 푸터 공통 UI 구성
- 사용자 프로필 드롭다운 메뉴 지원

### 게시글 CURD & 이미지 업로드
- 게시글 조회, 작성, 수정, 삭제
- 이미지 업로드 (AWS API Gateway, Lambda, S3 연동)
- 게시글 이미지 슬라이드 및 상세보기 UI 제공

### 댓글
- 댓글 작성, 조회

### JWT 기반 인증 UI
- 로그인을 통한 토큰 저장
- 인증 실패 시 자동 로그아웃 처리
- 프로필 정보와 이미지 수정

### REST API 연동
- 백엔드(Spring Boot)와의 명확한 책임 분리
- 응답, 에러 상태 처리 공통 모듈

---
# 시연 영상

https://github.com/user-attachments/assets/ce8af156-9619-4286-affa-00340fbdbcde



