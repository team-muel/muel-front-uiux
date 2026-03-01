export const dashboardText = {
  defaults: {
    testUrl: 'http://youtube.com/post/Ugkxr4ry97bvKkhD8_GmIvR7Oj7swnPq3Ca4?si=YPpWh7ZBLpSgkO-l',
  },
  status: {
    invalidYoutubeUrl: 'YouTube URL이 유효하지 않습니다.',
    adding: '추가 중...',
    addSuccess: '성공적으로 추가되었습니다.',
    addFailedPrefix: '추가 실패:',
    testChannelRequired: '오류: 채널을 먼저 선택해주세요.',
    testSending: '전송 중... (최대 30초 소요)',
    testSuccess: '성공: 테스트 전송이 완료되었습니다.',
    errorPrefix: '오류:',
  },
} as const;
