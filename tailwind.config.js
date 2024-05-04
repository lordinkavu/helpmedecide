/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Karla', 'sans-serif']
			}
		}
	},
	plugins: [require('@tailwindcss/forms')]
};
