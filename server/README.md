# Harry Potter Shop API

Node.js, Express, MongoDB 기반 백엔드입니다.

## 사전 준비

- Node.js 14.17 이상
- 로컬 MongoDB (`mongodb://127.0.0.1:27017`)
  - 이 프로젝트는 `server/.mongodb`의 `mongod`를 자동으로 띄웁니다.

## 시작하기

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

- 서버: `http://localhost:4000`
- 헬스 체크: `GET http://localhost:4000/api/health`

## 스크립트

- `npm run dev` — nodemon으로 개발 서버 실행
- `npm start` — 프로덕션 모드 실행
