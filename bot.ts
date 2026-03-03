import { client, startBot } from './src/bot';
import { setDefaultResultOrder } from 'dns';

setDefaultResultOrder('ipv4first');

process.on('unhandledRejection', (reason) => {
  console.error('[PROCESS] Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[PROCESS] Uncaught exception:', error);
});

const handleShutdownSignal = (signal: NodeJS.Signals) => {
  // 프로세스 종료 시 Discord 세션을 먼저 정리해 소켓 잔여 연결을 방지합니다.
  console.log(`[PROCESS] Received ${signal}, shutting down Discord client...`);
  try {
    if (client.isReady()) {
      client.destroy();
    }
  } catch (error) {
    console.error('[PROCESS] Failed during Discord client shutdown:', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdownSignal('SIGINT'));
process.on('SIGTERM', () => handleShutdownSignal('SIGTERM'));

const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;

// 봇이 안 켜질 때 범인을 찾는 디버그 로그
console.log('DEBUG: Token exists?', !!token, '| Key length:', token?.length || 0);

if (!token) {
  console.error('DISCORD token not provided. Set DISCORD_TOKEN or DISCORD_BOT_TOKEN.');
  process.exit(1);
}

// startBot 내부에서 연결/재연결 상태를 관리하므로 진입점에서는 호출과 예외만 관리합니다.
try {
  startBot(token); 
  console.log('Muel bot is initiating...'); 
} catch (err) {
  console.error('Failed to start bot:', err);
  process.exit(1);
}