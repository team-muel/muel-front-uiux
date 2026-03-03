import { type ReconnectReason, type ReconnectResult } from '../types/reconnectTelemetry';

export const toReconnectResult = (ok: boolean): ReconnectResult => {
  return ok ? 'success' : 'failed';
};

export const getReconnectFailureReason = (message: string): ReconnectReason => {
  if (message.includes('쿨다운')) return 'COOLDOWN';
  if (message.includes('진행 중')) return 'IN_FLIGHT';
  if (message.includes('활성 봇 토큰')) return 'NO_TOKEN';
  if (message.includes('실패')) return 'RECONNECT_FAILED';
  return 'UNKNOWN';
};

export const toReconnectResultFromStatus = (status: number): ReconnectResult => {
  if (status === 401 || status === 403 || status === 422) {
    return 'rejected';
  }

  return status >= 500 ? 'failed' : 'rejected';
};
