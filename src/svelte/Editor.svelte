<script lang='ts'>
    import { onMount } from 'svelte'
    import Editor from '../lang'
    import { EditorView } from '@codemirror/basic-setup'

    export let content: string
    let editor_div: HTMLDivElement
    let editor: EditorView

    onMount(() => {
        editor = Editor(editor_div, content)
    })

</script>

<div class='editor-wrapper' bind:this={editor_div}>
</div>
