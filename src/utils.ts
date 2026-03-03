// Utility helpers shared across server code

const IMAGE_FETCH_TIMEOUT_MS = Number(process.env.IMAGE_FETCH_TIMEOUT_MS || 10000);
const IMAGE_FETCH_MAX_BYTES = Number(process.env.IMAGE_FETCH_MAX_BYTES || 8000000);

/**
 * Validate if URL is a valid YouTube URL
 * Returns { valid: boolean, message?: string }
 * 
 * Examples:
 * - youtube.com/watch?v=dQw4w9WgXcQ ✅
 * - youtu.be/dQw4w9WgXcQ ✅
 * - youtube.com/post/POSTID ✅
 * - youtube.com/@channelname ✅
 * - youtube.com/channel/CHANNELID ✅
 * - google.com/search?q=youtube ❌
 */
// 유튜브 관련 유틸리티 제거됨

/**
 * Download an image URL and return a data URI string (base64) or undefined if failed
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Math.max(3000, IMAGE_FETCH_TIMEOUT_MS));

  try {
    const imgRes = await fetch(imageUrl, {
      signal: controller.signal,
    });
    if (!imgRes.ok) return undefined;

    const contentLengthRaw = imgRes.headers.get('content-length');
    const contentLength = contentLengthRaw ? Number(contentLengthRaw) : NaN;
    if (Number.isFinite(contentLength) && contentLength > IMAGE_FETCH_MAX_BYTES) {
      console.warn('[utils] imageUrlToBase64 skipped: content-length too large', contentLength);
      return undefined;
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    if (arrayBuffer.byteLength > IMAGE_FETCH_MAX_BYTES) {
      console.warn('[utils] imageUrlToBase64 skipped: downloaded payload too large', arrayBuffer.byteLength);
      return undefined;
    }

    const buffer = Buffer.from(arrayBuffer);
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.warn('[utils] imageUrlToBase64 failed', e);
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Truncate text to the given maximum length, appending ellipsis and note if clipped.
 */
export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...\n(내용이 너무 길어 생략되었습니다)';
}

/**
 * Convert error to safe client message:
 * - Hides sensitive database/API details
 * - Logs full error server-side for debugging
 */
export function getSafeErrorMessage(error: unknown, context: string): string {
  const fullMsg = error instanceof Error ? error.message : String(error);
  
  // Log full error server-side (not sent to client)
  console.error(`[${context}] Error detail:`, fullMsg);
  
  // Sanitize common error patterns
  const lowerMsg = fullMsg.toLowerCase();
  
  // Database errors
  if (lowerMsg.includes('supabase') || lowerMsg.includes('postgres') || lowerMsg.includes('database')) {
    return '데이터 작업 중 오류가 발생했습니다.';
  }
  
  // Network/fetch errors
  if (lowerMsg.includes('fetch') || lowerMsg.includes('network') || lowerMsg.includes('timeout')) {
    return '외부 서비스 연결 중 오류가 발생했습니다.';
  }
  
  // Discord API errors
  if (lowerMsg.includes('discord') || lowerMsg.includes('token')) {
    return 'Discord 연동 중 오류가 발생했습니다.';
  }
  
  // YouTube/scraper errors
  if (lowerMsg.includes('youtube') || lowerMsg.includes('scrape')) {
    return 'YouTube 정보를 가져올 수 없습니다. URL을 확인하세요.';
  }
  
  // Default generic message
  return '작업 처리 중 오류가 발생했습니다.';
}

/**
 * Maximum number of sources a user can register per guild (configurable via constant)
 */
export const MAX_SOURCES_PER_GUILD = 4;

/**
 * Default pagination limit for API responses
 */
export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_LOGS_DISPLAY = 50;

