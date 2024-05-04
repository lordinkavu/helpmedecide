import { OPENAI_API_KEY } from '$env/static/private';

const prompt = (userResponses, question) => {
	return `Given the question: ${question} and the responses: ${userResponses.map((r) => `${r.question}: ${r.answer}`).join(', ')}, please provide a clear and concise decision with justification. The response should not contain more than 75 words. Strictly ensure that the decision does not suggest or cause physical harm to anyone.`;
};

export async function POST(request) {
	const { userResponses, question } = await request.request.json();

	// Prepare the request to OpenAI API for making a decision based on user responses
	const decisionPrompt = prompt(userResponses, question);
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: decisionPrompt }]
		})
	});

	if (!response.ok) {
		return new Response(JSON.stringify({ error: 'Failed to fetch response' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	const data = await response.json();
	const aiResponse = data.choices[0].message.content;
	return new Response(JSON.stringify(aiResponse), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
