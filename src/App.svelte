<script lang='ts'>
    import * as rust from '../whale_rust_wasm/pkg'
    import type {} from '../whale_rust_wasm/pkg'
    import { RoamPage } from '../common/bindings/RoamPage'
    import Editor from 'src/svelte/Editor.svelte'
    import { RoamBlock } from '../common/bindings/RoamBlock'

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
            update_content()
        } catch (e) {
            console.log(
                `failed fetch data from from server - plz upload ${e.toString()}`
            )
            init = false
        }
    })()

    let content: string

    function update_content() {
        let map_child = (b: RoamBlock, level = 0) => {
            const own = `${' '.repeat(level * 2)}- ${b.string}\n`
            return own + (b.children?.map((c) => map_child(c, level + 1)).join('\n') ?? '')
        }
        content = data.map(p => '# ' + p.title + '\n' + (p.children?.map(map_child).join('') ?? '')).join('\n\n')
        console.log(content)
    }

    let fileinput: HTMLInputElement
    const onFileSelected = (e) => {
        let image = e.target.files[0]
        let reader = new FileReader()
        reader.readAsText(image)
        reader.onload = (e) => {
            data = rust.parse_dump(e.target.result.toString())
            update_content()
        }
    }
</script>

<div class='flow flex-col'>
    <header class='wr-uploader'>
        <div
            on:click={() => {
                fileinput.click()
            }}
        >
            Open dump file.
        </div>
        <input
            style='display:none'
            type='file'
            accept='.json'
            on:change={(e) => onFileSelected(e)}
            bind:this={fileinput}
        />
    </header>
    <main class='flex flex-row'>
        <div class='wr-page-container '>
            <ul class='p-5'>
                <li>
                    {#if content}
                        <Editor content='{content}' />
                    {/if}
                </li>
            </ul>
        </div>

    </main>
</div>

<style lang='scss'>
</style>
