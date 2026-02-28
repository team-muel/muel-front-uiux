import { startBot } from './src/bot';

const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error('DISCORD token not provided. Set DISCORD_TOKEN or DISCORD_BOT_TOKEN.');
  process.exit(1);
}

// 1. startBot이 Promise를 반환하지 않는 경우를 대비한 안전한 호출 방식
try {
  // 만약 startBot이 내부적으로 async라면, 아래처럼 호출하는 것이 가장 깔끔합니다.
  startBot(token); 
  console.log('Muel bot is initiating...'); 
} catch (err) {
  console.error('Failed to start bot:', err);
  process.exit(1);
}