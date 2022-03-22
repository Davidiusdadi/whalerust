<script lang='ts'>
    import Editor from 'src/svelte/Editor.svelte'
    import loadRoamData from 'src/db/roam-loader'
    import { File } from 'src/db/file'
    import { boostrap_via_server_dump } from 'src/store/boostrap'
    import { Index } from 'src/db/indexer'
    import IconFolderPlus from 'svelte-material-icons/FolderPlus.svelte'
    import LinkPlus from 'svelte-material-icons/LinkPlus.svelte'
    import WindowClose from 'svelte-material-icons/WindowClose.svelte'

    let is_url_dialog_open = false

    const size = '2em'
    const URL_LOCAL_STORAGE_KEY = 'roam_dump_json_url'
    let files: File[] = []

    let file: File | null
    let index: Index = new Index()

    let dom_file_input: HTMLInputElement

    let url_input_value = localStorage.getItem(URL_LOCAL_STORAGE_KEY) ?? '/api/dump'

    function manifestFile(name: string) {
        let file = files.find((f) => f.name_short === name)
        if (!file) { // lazy manifest page
            file = new File(`${name}.md`, ` # ${name} (new)`)
            files.push(file)
            index.addFile(file)
        }
        onUserFileSelected(file)
    }

    function onUserFileSelected(f: File | null) {
        {
            // drop editor and reload with new file
            file = null
            if (f) {
                console.log(`file selected: ${f.full_name}`)
                setTimeout(() => {
                    file = f
                }, 0)
            }
        }
    }

    function onLoadFinished() {
        onUserFileSelected(files[0] || null)
    }

    function setFiles(_files: File[]) {
        files = _files.sort((a, b) => {
            return b.date - a.date // desc
        })
        index = new Index()

        files.forEach((f) => index.addFile(f))

        ;(window as any).files = files // 4 debug purposes
        ;(window as any).index = index
    }

    onLoadUrl(url_input_value)

    function onLocalFileSelected(e: Event) {
        const target = e.target as HTMLInputElement | null
        let selected_file = target?.files?.[0]

        if (!selected_file) {
            console.log('no file selected')
            return
        }

        let reader = new FileReader()
        reader.readAsText(selected_file)
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const file_content = e.target!.result!.toString()
            setFiles(loadRoamData(file_content))
            onLoadFinished()
        }
    }

    function onLoadUrl(url: string) {
        console.info(`opening url: ${url}`)
        boostrap_via_server_dump(url_input_value)
            .then((loaded_files) => {
                localStorage.setItem(URL_LOCAL_STORAGE_KEY, url_input_value)
                setFiles(loaded_files)
            })
            .catch((e) => {
                files = []
                console.error(`opening failed: ${url}\n error: ${e.toString()}`)
            })
            .finally(onLoadFinished)
    }
</script>

<svelte:window
    on:keydown={(e) => { is_url_dialog_open = is_url_dialog_open ? e.keyCode !== 27 : is_url_dialog_open } } />

<div class='flex flex-col'>
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
                    accept='.json'
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

                    {#if is_url_dialog_open === true}
                        <div
                            on:click|self|stopPropagation={() => is_url_dialog_open = false}
                            class='wr-backdrop absolute bg-opacity-70 bg-white z-50 inset-0 flex justify-center items-center'>
                            <div class='bg-white border-4 border-slate-400 rounded-lg'>
                                <div class='bg-slate-400 flex justify-end items-center'>
                                    <div on:click|stopPropagation={() => is_url_dialog_open = false}>
                                        <WindowClose size='{size}' />
                                    </div>
                                </div>
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
                            </div>
                        </div>
                    {/if}
                </button>
            </div>
        </div>
    </header>
    <main class='flex flex-row items-start'>
        <div class='wr-sidebar bg-slate-800'>
            <ul class='p-5'>
                {#each files as file}
                    <li>
                        <button
                            title='last update: {file.getLastModified()}'
                            on:click={() => onUserFileSelected(file)}
                            type='button'
                            class='m-1 px-2 py-1 text-slate-300 font-thin text-xs text-left'
                        >{file.full_name}</button
                        >
                    </li>
                {/each}
            </ul>
        </div>
        <div class='wr-page-container flex pl-5'>
            {#if file}
                <Editor file={file} index='{index}' open_page='{manifestFile}' />
            {/if}
        </div>
    </main>
</div>

<style lang='scss'>
</style>
