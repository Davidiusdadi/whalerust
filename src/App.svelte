<script lang='ts'>
    import Editor from 'src/svelte/Editor.svelte'
    import loadRoamData from 'src/db/roam-loader'
    import { File } from 'src/db/file'
    import { boostrap_via_server_dump } from 'src/store/boostrap'

    const URL_LOCAL_STORAGE_KEY = 'roam_dump_json_url'
    let files: File[] = []

    let file: File | null

    let dom_file_input: HTMLInputElement
    let url_input_value: string = localStorage.getItem(URL_LOCAL_STORAGE_KEY) || '/api/dump'

    function onUserFileSelected(f: File | null) {

        { // drop editor and reload with new file
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
        });
        (window as any).files = files // 4 debug purposes
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

<div class='flex flex-col'>
    <header class='wr-uploader flex flex-row'>
        <div class='border-r mr-4 pr-4'>
            <div
                class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400'
                on:click={() => {
                dom_file_input.click()
            }}
            >
                Open dump file.
            </div>
            <input
                style='display:none'
                type='file'
                accept='.json'
                on:change={(e) => onLocalFileSelected(e)}
                bind:this={dom_file_input}
            />
        </div>
        <div class='flex-grow flex'>
            <div class='m-auto'>URL:</div>
            <input class='text-base border flex-grow rounded-full bg-slate-300 m-2 pl-5' bind:value={url_input_value} />
        </div>
        <button
            class='bg-slate-500 p-2 m-2 rounded-md hover:bg-slate-400'
            on:click={() => onLoadUrl(url_input_value)}
        >Load Url
        </button>
    </header>
    <main class='flex flex-row'>
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
        <div class='wr-page-container '>
            <ul class='p-5'>
                {#if file}
                    <li>
                        <Editor content={file.content} />
                    </li>
                {/if}
            </ul>
        </div>
    </main>
</div>

<style lang='scss'>
</style>
