<script lang='ts'>
    import Magnify from 'svelte-material-icons/Magnify.svelte'
    import { size } from 'src/store/defaults'
    import Dialog from 'src/svelte/Dialog.svelte'
    import { userActionViewPage, suggest } from 'src/store/core'

    let show = false
    let dom_input: HTMLInputElement

    let input = ''


    $: suggestions = suggest(input)
    $: if (show) {
        // focus but not before node has been inserted
        setTimeout(() => dom_input.focus(), 0)
    }

    function keyDown(e: KeyboardEvent) {
        if (!show && e.ctrlKey && e.key === 'o') {
            show = true
            e.stopPropagation()
            e.preventDefault()
        }
    }

</script>

<svelte:window on:keydown={keyDown} />

<div class='flex'>
    <button class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400' on:click={() => show = true}>
        <Magnify {size} />

        <Dialog bind:show='{show}' dialog_class='justify-self-start self-start mt-40' >
            <div slot='title-bar'></div>
            <div>
                <input
                    bind:this={dom_input}
                    spellcheck='false'
                    placeholder='search'
                    type='url'
                    class='my-3 ml-4 text-base border flex-grow rounded-full bg-slate-300 m-2 pl-5'
                    bind:value={input}
                />
                <ul class=''>
                    {#each suggestions as suggestion}
                        <li>
                            <button
                                on:click={() => userActionViewPage(suggestion.file)}
                            >
                                {suggestion.file.name_short}
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>
        </Dialog>
    </button>
</div>

