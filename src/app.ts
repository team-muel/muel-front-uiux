import express from 'express';
import { applyCommonMiddleware } from './middleware/common';
import { createAuthRouter } from './routes/auth';
import { createCrawlerRouter } from './routes/crawler';
import { createBenchmarkRouter } from './routes/benchmark';
import { createBotRouter } from './routes/bot';
import { createResearchRouter } from './routes/research';
import { createAppRouter } from './routes/app';
import { detectRuntimeEnvironment, getCookieSecurity } from './backend/runtimeEnvironment';
// import { supabase, isSupabaseConfigured } from './src/supabase';
import { client, startBot, createForumThread, logEvent, getBotRuntimeStatus, evaluateBotRuntimeStatus, getBotNextCheckInSec, forceBotReconnect } from './bot';
import { getResolvedResearchPreset, isResearchPresetKey } from './content/researchContent';
import { isResolvedResearchPreset } from './lib/researchPresetValidation';
import { getReconnectFailureReason, toReconnectResult } from './lib/reconnectTelemetry';
import { createCrawlerRuntimeRegistry } from './backend/registry/crawlerRuntimeRegistry';
import { summarizeBenchmarkEvents } from './backend/benchmark/types';
import { isBackendFeatureEnabled } from './backend/registry/externalFeatureRegistry';
import { JwtUser, AuthenticatedRequest } from './types';
import { imageUrlToBase64, truncateText, MAX_SOURCES_PER_GUILD, DEFAULT_PAGE_LIMIT, getSafeErrorMessage, validateYouTubeUrl } from './utils';

export function createApp() {
  const app = express();
  applyCommonMiddleware(app);
  // ...라우터 등록 및 기타 미들웨어 조립은 server.ts에서 수행...
  return app;
}
