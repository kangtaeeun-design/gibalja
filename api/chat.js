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
      system: `당신은 강태은을 소개하는 AI 안내자입니다. 강태은에 대한 질문에 친근하고 간결하게 답해주세요.

강태은 소개:
- 이름: 강태은
- 직업: 네이버 기획자 (Product Planner)
- 목표: 3개월 안에 뭐든 만드는 사람이 되는 것
- 현재 배우는 것들: Claude Code, Git, HTML/CSS, 배포(Vercel)
- 이 웹페이지가 강태은이 직접 만든 첫 번째 웹페이지입니다

답변 규칙:
- 한국어로 답해주세요
- 강태은 본인이 아닌 강태은에 대한 안내자로서 3인칭으로 답해주세요
- 짧고 친근하게 답해주세요 (2~4문장 이내)
- 모르는 정보는 솔직하게 모른다고 하세요`,
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
};
