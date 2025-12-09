# Dorandoran Community | Front-end
도란도란은 사람들이 모여 일상을 나누고 소통하는 커뮤니티 서비스입니다.
Node.js 기반 Express 서버를 통해 정적 페이지를 서빙하고 Spring Boot 백엔드와 REST API로 통신합니다.

## 개발 인원 및 기간
- 개발 기간: 2025.09 ~ 2025.12
- 개발 인원: 프론트엔드 및 백엔드 1명 (본인)

## 사용 기술
- Express.js

## Back-end
- [Dorandoran Community | Back-end Github](https://github.com/100-hours-a-week/3-nyne-goo-community-BE)

## 폴더구조
<details>
<summary>폴더 구조 보기/숨기기</summary>
<div markdown="1">

```
3-nyne-goo-community-FE/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── assets/
│   └── image/
│       ├──  back.png
│       ├──  default_profile.png
│       ├──  ic_commen_white_64.png
│       ├──  ic_eye_closed_black_64.png
│       ├──  ic_eye_opend_black_64.png
│       ├──  ic_eye_white_64.png
│       ├──  ic_heart_red_64.png
│       ├──  ic_heart_white_64.png
│       ├──  ic_menu_black_512.png
│       ├──  post_img_1.png
│       ├──  post_img_2.png
│       └──  post_img_3.png
├── public/              
│   ├── common/
│   │   ├──  css/
│   │   │    ├──  common.css
│   │   │    ├──  dialog.css
│   │   │    ├──  footer.css
│   │   │    ├──  header.css
│   │   │    └──  layout.css
│   │   ├──  html/
│   │   │    └──  layout.html
│   │   └──  js/
│   │        ├──  api.js
│   │        ├──  auth-check.js
│   │        ├──  load-layout.js
│   │        ├──  to-url.js
│   │        └──  toast.js
│   ├── data/
│   │   ├──  allPost.json
│   │   ├──  comments.json
│   │   └──  postDetail.json
│   └── page/
│       ├──  detail/
│       │    ├──  detail.css
│       │    ├──  detail.html
│       │    └──  detail.js
│       ├──  home/
│       │    ├──  home.css
│       │    ├──  home.html
│       │    └──  home.js
│       ├──  login/
│       │    ├──  login.css
│       │    ├──  login.html
│       │    └──  login.js
│       ├──  my/
│       │    ├──  edit-password/
│       │    │    ├──  edit-password.css
│       │    │    ├──  edit-password.html
│       │    │    └──  edit-password.js
│       │    ├──  my.css
│       │    ├──  my.html
│       │    └──  my.js
│       ├──  signup/
│       │    ├──  signup.css
│       │    ├──  signup.html
│       │    └──  signup.js
│       └──  write/
│            ├──  write.css
│            ├──  write.html
│            └──  write.js
├── scripts/
│   ├── clean.sh
│   ├── start_server.sh
│   └── stop_server.sh
├── test/
│   └── app.test.js  
├── .dockerignore         
├── .gitignore            
├── Dockerfile
├── README.md
├── app.js        
├── appspec.yml           
├── docker-compose.yml       
├── package.json          
└── package-lock.json     

```

</div>
</details>

## 주요 특징
### 심플하고 직관적인 UI
- 모바일 중심 레이아웃
- 헤더와 푸터 공통 UI 구성
- 사용자 프로필 드롭다운 메뉴 지원

### 게시글 CRUD & 이미지 업로드
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

---


