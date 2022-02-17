# whalerust

Experimental offline viewer for roamresearch json dumps.

Personal project get to know learn rust, wasm and svelte.

### dev setup

install `cargo`, `yarn`, [tauri](https://tauri.studio/docs/getting-started/setting-up-linux)


1. run `cargo test` (required for generating typescript bindings)
2. run `cargo run --package server --bin main path/to/your/roam_dump.json` 
3. run `yarn dev` to actual frontend (and proxying to the rust server)


### tauri release

```
yarn install
yarn build
yarn tauri build
```