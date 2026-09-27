# Harry Potter Shop Client

Vite + React 프론트엔드입니다. Vite 5는 Node 18 이상이 필요합니다. 시스템 Node가 그보다 낮으면 프로젝트의 `.tools/node`를 사용합니다.

## 시작하기

```bash
cd client
npm install
npm run dev
```

- 앱: `http://localhost:5173`
- `/api` 요청은 `http://localhost:4000` 서버로 프록시됩니다.

백엔드와 함께 쓰려면 `server`에서 `npm run dev`를 먼저 실행하세요.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run preview` — 빌드 미리보기
- `npm run lint` — ESLint
