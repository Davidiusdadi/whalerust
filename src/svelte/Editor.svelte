<script lang='ts'>
    import { onMount } from 'svelte'
    import Editor from '../lang/editor'
    import { EditorView } from '@codemirror/basic-setup'
    import { Index } from 'src/db/indexer'

    export let content: string
    export let index: Index

    let editor_div: HTMLDivElement
    let editor: EditorView

    onMount(() => {
        editor = Editor(editor_div, content, index)
    })

</script>

<div class='editor-wrapper' bind:this={editor_div}>
</div>
