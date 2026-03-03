# Backend Boundary

이 폴더는 **백엔드 전용 import 경계**입니다.

- 서버 엔트리(`server.ts`)와 봇 엔트리(`bot.ts`)는 이 경로만 통해 백엔드 모듈을 가져옵니다.
- 현재는 점진적 정리를 위해 다수 파일이 re-export 형태입니다.
- 신규 백엔드 로직은 가능하면 `src/backend/*`에 직접 배치하고, 기존 `src/*` 레거시는 단계적으로 축소합니다.

## 현재 의도

- Frontend(UI): `src/components`, `src/pages`, `src/hooks`, `src/main.tsx`, `src/App.tsx`
- Backend(Runtime): `server.ts`, `bot.ts`, `src/backend/*`
- Shared 타입/콘텐츠는 필요 시 `src/shared/*`로 이동하는 2차 정리를 권장합니다.
