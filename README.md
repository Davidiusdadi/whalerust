# whalerust

Experimental offline viewer for roamresearch json dumps.

Personal project get to know learn rust, wasm and svelte.

### dev setup

1. run `cargo test` (required for generating typescript bindings)
2. run `cargo run --package server --bin main path/to/your/roam_dump.json` 
3. run `yarn dev` to actual frontend (and proxying to the rust server)