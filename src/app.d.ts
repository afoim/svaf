// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@toast-ui/editor' {
	const Editor: any;
	export default Editor;
	export type EditorOptions = any;
}

declare module '@toast-ui/editor/dist/toastui-editor.css';

export {};
