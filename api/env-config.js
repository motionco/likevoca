export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 클라이언트에 필요한 환경변수만 노출
    const config = {
      kakaoAppKey: process.env.KAKAO_APP_KEY || null,
      // 개발 환경 감지
      isDevelopment: process.env.NODE_ENV !== 'production'
    };

    res.status(200).json(config);
  } catch (error) {
    console.error('Environment config error:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
}