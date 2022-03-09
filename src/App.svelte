<script lang="ts">
    import * as rust from '../whale_rust_wasm/pkg'
    import type {} from '../whale_rust_wasm/pkg'
    import { RoamPage } from '../common/bindings/RoamPage'
    import Page from 'src/svelte/Page.svelte'

    let init = false
    let data: RoamPage[] = []

    ;(async () => {
        try {
            console.log(`trying to fetch dump from from server`)
            const resp = await fetch('/api/dump')
            const text = await resp.text()
            data = rust.parse_dump(text)
            console.log(data)
            init = true
        } catch (e) {
            console.log(
                `failed fetch data from from server - plz upload ${e.toString()}`
            )
            init = false
        }
    })()

    let fileinput: HTMLInputElement
    const onFileSelected = (e) => {
        let image = e.target.files[0]
        let reader = new FileReader()
        reader.readAsText(image)
        reader.onload = (e) => {
            data = rust.parse_dump(e.target.result.toString())
        }
    }
</script>

<div class="flow flex-col">
    <header class="wr-uploader">
        <div
            on:click={() => {
                fileinput.click()
            }}
        >
            Open dump file.
        </div>
        <input
            style="display:none"
            type="file"
            accept=".json"
            on:change={(e) => onFileSelected(e)}
            bind:this={fileinput}
        />
    </header>
    <main class="flex flex-row">
        <div class="wr-page-container ">
            <ul class="p-5">
                {#each data as page}
                    <li>
                        <Page {page} />
                    </li>
                {/each}
            </ul>
        </div>

    </main>
</div>

<style lang="scss">
</style>
