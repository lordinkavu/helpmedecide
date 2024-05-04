<script>
	import '../app.css';
	let question = '';
	let questions = [];
	let decision = 'Based on the user responses, the decision is';
	let userResponses = {};
	let showResult = false;
	let currentQuestionIndex = 0;

	let responseLoading = false;

	async function handleSubmit(event) {
		event.preventDefault();
		responseLoading = true;
		try {
			const response = await fetch('/question', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question })
			});
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			questions = await response.json(); // Get the response as text
			// initialise userResponses
			userResponses = questions.reduce(
				(acc, q, index) => ({
					...acc,
					[index]: {
						question: q.question,
						answer: null // Initialize with null indicating no answer selected yet
					}
				}),
				{}
			);
			currentQuestionIndex = 0; // Start with the first question
		} catch (error) {
			alert('Sorry, something went wrong. Please try again later.');
		} finally {
			responseLoading = false;
		}
	}

	function handleOptionSelect(value) {
		userResponses[currentQuestionIndex].answer = value;
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex++;
		} else {
			calculateDecision();
		}
	}

	async function calculateDecision() {
		responseLoading = true;
		showResult = true;
		try {
			// modify user responses as expected by the decision route
			const modifiedUserResponses = Object.values(userResponses).map((r) => ({
				question: r.question,
				answer: r.answer
			}));
			const response = await fetch('/decision', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userResponses: modifiedUserResponses, question: question })
			});
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			decision = await response.json();
		} catch (error) {
			alert('Sorry, something went wrong. Please try again later.');
		} finally {
			responseLoading = false;
		}
	}
</script>

<section class="mx-auto max-w-md px-8 pt-[35vh]">
	{#if questions.length === 0}
		<form on:submit={handleSubmit} class="flex flex-col w-full">
			<label for="decision" class="block font-medium leading-6 text-gray-900"
				>helpmedecide 🫂
			</label>
			<div class="relative mt-4 flex items-center">
				<input
					autofocus
					class="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					placeholder="eg. should i take a career break"
					id="decision"
					type="text"
					bind:value={question}
				/>
				<div class="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
					<kbd
						class="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400"
					>
						⏎ Enter / Return
					</kbd>
				</div>
			</div>

			<!-- 	<div>
				<button type="submit">Submit</button>
			</div> -->
			<div class="mt-4">
				<button
					type="submit"
					class="rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
					>{responseLoading ? 'Submitting...' : 'Submit'}</button
				>
			</div>
		</form>
	{/if}

	{#if questions.length > 0 && !showResult}
		<div class="flex flex-col">
			<div class="block leading-6 text-gray-900">
				{currentQuestionIndex + 1}
				<span class="text-xs">&rarr;</span>
				&nbsp;
				{questions[currentQuestionIndex].question}
			</div>
			<div class="mt-4 flex flex-col gap-2">
				{#each questions[currentQuestionIndex].options as { option }, index}
					<div>
						<button
							class="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 min-w-[100px] text-start max-w-sm"
							on:click={() => handleOptionSelect(option)}
						>
							<!-- 	<span class="text-sm px-1 border border-gray-300 rounded-sm mr-2">
								{String.fromCharCode(65 + index)}
							</span> -->
							{option}</button
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if showResult}
		<div class="flex flex-col gap-4">
			<p class="block font-medium leading-6 text-gray-900">helpmedecide 🫂</p>

			<p>{responseLoading ? 'Reaching out to the universe...' : decision}</p>
			<div>
				<button
					on:click={() => window.location.reload()}
					class="rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
					>New decision &rarr;</button
				>
			</div>
		</div>
	{/if}

	<footer class="absolute bottom-4 text-sm text-center">
		<p>
			Made by <a class="underline" href="https://twitter.com/ingaavu" target="_blank">ingau</a>,
			also,
			<a class="underline" href="https://buymeacoffee.com/ingau" target="_blank"
				>buy me a coffee
			</a> ?
		</p>
		<p class="text-gray-600 mt-1">
			Disclaimer: This is a fun project and suggestions should not be taken seriously 🙏
		</p>
	</footer>
</section>
