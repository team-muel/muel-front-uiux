export type ReconnectResult = 'success' | 'failed' | 'rejected';

export type ReconnectReason =
  | 'OK'
  | 'COOLDOWN'
  | 'COOLDOWN_API'
  | 'IN_FLIGHT'
  | 'NO_TOKEN'
  | 'RECONNECT_FAILED'
  | 'REQUESTER_MISMATCH'
  | 'EXPIRED'
  | 'FORBIDDEN'
  | 'CONFIG'
  | 'UNKNOWN'
  | 'NETWORK';

export type ReconnectSource = 'api' | 'slash' | 'button' | 'ui';
