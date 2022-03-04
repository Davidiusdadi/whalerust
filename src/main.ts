import App from './App.svelte';

import * as rwasm from '../whale_rust_wasm/pkg'

window['rwasm'] = rwasm // for convenience / debuggability

const app = new App({
	target: document.body
});

export default app;

