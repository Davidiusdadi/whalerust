<script lang='ts'>
    import { onMount } from 'svelte'
    import type { File } from 'src/db/file'
    import Editor from '../lang/editor'
    import type { EditorView } from '@codemirror/basic-setup'
    import type { Index } from 'src/db/indexer'
    import { manifestFile, userActionViewPage } from 'src/store/core'

    export let file: File
    export let index: Index

    function open_page(name: string) {
        userActionViewPage(manifestFile(file.source, name))
    }

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
                let x_data_target = t.getAttribute('x-data-target')
                if (t.parentElement) {
                    if (t.parentElement instanceof HTMLAnchorElement) {
                        window.open(t.parentElement.href, t.parentElement.target)
                    }
                    if (!x_data_target) {
                        x_data_target = t.parentElement.getAttribute('x-data-target')
                    }
                }


                if (x_data_target) {
                    console.log(`click on ${x_data_target}`)
                    open_page(x_data_target)
                }
            }
        })
    })
</script>

<div bind:this={editor_container} class='flex-grow'>
    <div class='editor-wrapper' bind:this={editor_div} />
    <div>
        <div class='text-lg text-gray-400'>Backlinks</div>
        <ul class='list-disc pl-5'>
            {#each backrefs as ref}
                <li class='cursor-pointer' on:click={() => open_page(ref.from)}>
                    {ref.from}
                </li>
            {/each}
        </ul>
    </div>
</div>
