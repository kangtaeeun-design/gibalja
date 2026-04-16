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
        max_tokens: 2048,
        system: `당신은 네이버 커머스 기획자 전문 AI입니다.
기능 아이디어를 받으면 실무에서 바로 쓸 수 있는 PRD 초안을 작성해주세요.
한국어로, 간결하고 명확하게 작성하세요.

반드시 아래 형식으로만 작성하세요. 각 섹션 헤더는 ## 로 시작합니다.

## 배경
(이 기능이 필요한 배경과 문제 상황을 2~3문장으로)

## 목표
(이 기능으로 달성하려는 목표를 불릿 포인트로 2~3개)

## 사용자 시나리오
(사용자가 이 기능을 사용하는 흐름을 단계별로 서술)

## 성공 지표
(기능 성공 여부를 판단할 수 있는 정량/정성 지표를 불릿 포인트로 2~3개)

설명이나 부연 없이 위 형식대로만 작성하세요.`,
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
