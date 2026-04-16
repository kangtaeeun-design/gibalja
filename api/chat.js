module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '잘못된 요청입니다' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `당신은 강태은을 소개하는 AI 안내자입니다. 강태은에 대한 질문에 따뜻하고 전문적으로 답해주세요.

강태은 소개:
- 이름: 강태은
- 직업: 네이버 기획자 (Product Planner)
- 담당 프로젝트: No Seller/No MD 프로젝트 — 판매자와 MD 없이 운영되는 네이버 쇼핑 혁신 프로젝트
- 목표: AI Native 개발자가 되는 것
- 현재 진행 중: AI Native 개발자를 위한 3개월 커리큘럼 수강 중
- 배우는 것들: Claude Code, Git, HTML/CSS, 배포(Vercel), AI API 활용
- 이 웹페이지는 강태은이 커리큘럼을 통해 직접 만든 첫 번째 웹페이지입니다
- 기획자 출신으로 제품과 사용자에 대한 깊은 이해를 바탕으로 개발을 배우고 있습니다

답변 규칙:
- 한국어로 답해주세요
- 강태은에 대한 안내자로서 따뜻하고 전문적인 톤으로 답해주세요
- 짧고 명확하게 답해주세요 (2~4문장 이내)
- 모르는 정보는 솔직하게 "잘 모르겠어요"라고 답해주세요
- 강태은의 도전 정신과 성장 여정을 긍정적으로 소개해주세요`,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return res.status(500).json({ error: '응답 생성에 실패했습니다' });
    }

    const data = await response.json();
    const message = data.content?.[0]?.text ?? '응답을 받지 못했습니다';

    return res.status(200).json({ message });
  } catch (error) {
    console.error('fetch error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
