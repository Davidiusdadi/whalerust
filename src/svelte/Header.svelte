<script lang='ts'>
    import IconFolderPlus from 'svelte-material-icons/FolderPlus.svelte'
    import LinkPlus from 'svelte-material-icons/LinkPlus.svelte'
    import Dialog from './Dialog.svelte'
    import Finder from './Finder.svelte'
    import { size } from '../store/defaults'
    import loadRoamData from 'src/db/roam-loader'
    import { setFiles, onLoadUrl } from 'src/store/core'
    import loadMdData from 'src/db/markdown-loader'
    import { Source } from 'src/db/file_source'
    import type { File } from 'src/db/file'

    let url_input_value: string = ''
    let is_url_dialog_open = false

    let dom_file_input: HTMLInputElement

    function onLocalFileSelected(e: Event) {
        const target = e.target as HTMLInputElement | null
        let selected_file = target?.files?.[0]

        if (!selected_file) {
            console.log('no file selected')
            return
        }

        let loader: (content: string) => File[]
        const file_name = selected_file.name
        const source = new Source(file_name)
        if (selected_file.name.toLowerCase().endsWith('.json')) {
            loader = (c: string) => {
                return loadRoamData(source, c)
            }
        } else if (selected_file.name.toLowerCase().endsWith('.md')) {
            loader = (c: string) => loadMdData(source, file_name, c)
        } else {
            console.error(``)
            return
        }

        let reader = new FileReader()
        reader.readAsText(selected_file)
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const file_content = e.target!.result!.toString()
            setFiles(loader(file_content))
        }


    }


</script>

<header class='wr-uploader flex flex-row'>
    <div class='flex'>
        <div class='border-r px-2'>
            <button
                title='open roam json dump'
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
                on:change={(e) => onLocalFileSelected(e)}
                bind:this={dom_file_input}
            />
        </div>
        <div class='border-r px-2'>
            <button
                on:click|stopPropagation={() => is_url_dialog_open = true}
                title='open roam dump via url'
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
                                class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400'
                                on:click|self|stopPropagation={() => { is_url_dialog_open = false; onLoadUrl(url_input_value) }}
                            >Load Url
                            </button>
                        </div>
                    </div>
                </Dialog>
            </button>
        </div>
        <Finder />
    </div>
</header>