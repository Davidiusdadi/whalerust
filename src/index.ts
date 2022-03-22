import './styles/tailwind.css'
import App from './App.svelte'

import * as rwasm from '../whale_rust_wasm/pkg'

(window as any).rwasm = rwasm // for convenience / debuggability


import { invoke } from '@tauri-apps/api/tauri'

invoke('my_custom_command')

const app = new App({
    target: document.body
})

export default app

