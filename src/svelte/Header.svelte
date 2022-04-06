<script lang='ts'>
    import IconFolderPlus from 'svelte-material-icons/FolderPlus.svelte'
    import LinkPlus from 'svelte-material-icons/LinkPlus.svelte'
    import Sunglasses from 'svelte-material-icons/Sunglasses.svelte'
    import Dialog from './Dialog.svelte'
    import Finder from './Finder.svelte'
    import { size } from '../store/defaults'
    import { fetchUrl, openLocalFile } from 'src/store/io'
    import { editor_view_mode } from 'src/store/core'

    let url_input_value: string = ''
    let is_url_dialog_open = false

    let dom_file_input: HTMLInputElement


</script>

<header class='wr-uploader flex justify-between'>
    <div class='flex'>
        <div class='border-r px-2'>
            <button
                title='open markdown or roam json dump'
                class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400'
                on:click={() => {
                        dom_file_input.click()
                    }}
            >
                <IconFolderPlus {size} />
            </button>
            <input
                style='display:none'
                type='file'
                accept='*.json, *.md'
                on:change={(e) => openLocalFile(e)}
                bind:this={dom_file_input}
            />
        </div>
        <div class='border-r px-2'>
            <button
                on:click|stopPropagation={() => is_url_dialog_open = true}
                title='open markdown or roam dump via URL'
                class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400'
            >
                <LinkPlus {size} />
                <Dialog bind:show='{is_url_dialog_open}'>
                    <div class='p-5'>
                        <div class=''>
                            <div class='flex-grow flex'>
                                <div class='m-auto'>URL:</div>
                                <input
                                    spellcheck='false'
                                    type='url'
                                    class='text-base border flex-grow rounded-full bg-slate-300 m-2 pl-5'
                                    bind:value={url_input_value}
                                />
                            </div>
                        </div>
                        <div class='flex justify-end'>
                            <button
                                title='ctrl-o'
                                class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400'
                                on:click|self|stopPropagation={() => { is_url_dialog_open = false; fetchUrl(url_input_value) }}
                            >Load Url
                            </button>
                        </div>
                    </div>
                </Dialog>
            </button>
        </div>
        <Finder />
    </div>
    <div>
        <div class='border-r px-2 justify-self-end'>
            <button
                on:click|stopPropagation={() => editor_view_mode.set($editor_view_mode === 'fancy' ? 'plain' : 'fancy')}
                title='toggle editor view mode (fancy / plain)'
                class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400'
            >
                <Sunglasses {size} />
            </button>
        </div>
    </div>
</header>