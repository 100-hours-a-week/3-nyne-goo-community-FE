FROM node:20-alpine

# 작업 디렉토리를 /app으로 설정
WORKDIR /app

#package.json과 package-lock.json 파일을 현재 작업 디렉토리로 복사
COPY package.json package-lock.json ./

# npm 을 사용해 종속성 설치
RUN npm install

# 현재 디렉토리의 모든 파일을 Docker 이미지 내의 작업 디렉토리(WORKDIR)로 복사.
COPY . .

# 사용할 포트
EXPOSE 3000

# 컨테이서 실행될 때 앱 시작
CMD ["npm", "start"]
