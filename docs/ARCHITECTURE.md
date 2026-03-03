# Architecture (Frontend / Backend Split)

현재 Render에서 단일 서비스로 프론트 + 백엔드가 함께 실행되더라도, 코드 구조는 아래처럼 경계를 둡니다.

## Runtime

- Frontend build/runtime: Vite + React
- Backend runtime: Express API + Discord Bot

## Code Boundary

- Frontend 중심 경로
  - `src/components/*`
  - `src/pages/*`
  - `src/hooks/*`
  - `src/main.tsx`, `src/App.tsx`
- Backend 중심 경로
  - `server.ts`
  - `bot.ts`
  - `src/backend/*` (백엔드 전용 import 경계)

## Import Rule

- `server.ts`, `bot.ts`는 백엔드 의존성을 `src/backend/*`에서만 import 합니다.
- 프론트 코드에서 `server.ts`/`bot.ts` 런타임 의존을 직접 참조하지 않습니다.

## Why this shape

- 배포는 단일 서비스로 유지하면서도, 코드 관점에서 책임 분리를 명확히 할 수 있습니다.
- 추후 Render Worker 분리 시에도 `src/backend/*` 경계를 기준으로 이동이 쉬워집니다.
