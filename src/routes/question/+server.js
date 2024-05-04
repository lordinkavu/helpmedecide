import { OPENAI_API_KEY } from '$env/static/private';

const prompt = (question) => {
	return `Given the decision-making question "${question}", generate a structured guide to help in making this decision. The response should include:
- A list of 5 related questions each aimed at uncovering aspects of the decision.
- For each question, provide 3 options from which the user can select one.

Format the response as a RFC8259 compliant JSON object with the following structure:
  [
    {
      "question": "Specific question related to the decision",
      "options": [
        {"option": "Option 1"},
        {"option": "Option 2"},
        {"option": "Option 3"}
      ]
    },
    ...more questions...
  ]
  
 Response: `;
};

const MAX_RETRIES = 2;

function isValidResponseFormat(response) {
	if (!Array.isArray(response)) return false;
	return response.every(
		(item) =>
			typeof item === 'object' &&
			'question' in item &&
			'options' in item &&
			Array.isArray(item.options) &&
			item.options.every((option) => typeof option === 'object' && 'option' in option)
	);
}

async function getOpenAiResponse(question) {
	let attempts = 0;
	while (attempts < MAX_RETRIES) {
		try {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_API_KEY}`
				},
				body: JSON.stringify({
					model: 'gpt-3.5-turbo',
					messages: [{ role: 'user', content: prompt(question) }]
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch response');
			}

			const data = await response.json();
			const parsedResponse = JSON.parse(data.choices[0].message.content); // Attempt to parse the JSON response
			if (isValidResponseFormat(parsedResponse)) {
				console.log('Valid JSON format');
				return parsedResponse; // Return the parsed JSON if it's valid
			} else {
				throw new Error('Invalid JSON format');
			}
		} catch (error) {
			console.log('Error:', error);
			attempts++;
			if (attempts === MAX_RETRIES) {
				throw new Error(
					`Failed to parse response as valid JSON after ${MAX_RETRIES} attempts: ${error.message}`
				);
			}
		}
	}
}

export async function POST(request) {
	try {
		const { question } = await request.request.json();
		const response = await getOpenAiResponse(question);
		return new Response(JSON.stringify(response), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch response' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}
