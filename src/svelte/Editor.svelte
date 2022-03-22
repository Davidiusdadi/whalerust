<script lang='ts'>
    import { onMount } from 'svelte'
    import { File } from '../db/file'
    import Editor from '../lang/editor'
    import { EditorView } from '@codemirror/basic-setup'
    import { Index } from '../db/indexer'

    export let file: File
    export let index: Index
    export let open_page: (page: string) => void

    let editor_div: HTMLDivElement
    let editor: EditorView

    const backrefs = index.getBackLinks(file)

    let editor_container: HTMLElement

    onMount(() => {
        editor = Editor(editor_div, file.content, index)
        editor_container.addEventListener('click', (e) => {
            console.log('click event: ', e)
            const t = e.target
            if (t instanceof HTMLElement) {
                const x_data_target = t.getAttribute('x-data-target') ?? t.parentElement!.getAttribute('x-data-target')
                if (x_data_target) {
                    console.log(`click on ${x_data_target}`)
                    open_page(x_data_target)
                }
            }
        })
    })
</script>

<div bind:this={editor_container}>
    <div class='editor-wrapper flex' bind:this={editor_div} />
    <div>
        <div class='text-lg text-gray-400 cursor-pointer'>Backlinks</div>
        <ul class='list-disc pl-5'>
            {#each backrefs as ref}
                <li on:click={() => open_page(ref.from)}>
                    {ref.from}
                </li>
            {/each}
        </ul>
    </div>
</div>
