<script lang='ts'>
    import Editor from 'src/svelte/Editor.svelte'
    import type { File } from 'src/db/file'
    import Header from 'src/svelte/Header.svelte'
    import { files, index, file, manifestFile, onUserFileSelected } from './store/core'


    let dislayed_file: File | null = null
    file.subscribe((f) => {
        // drop editor and reload with new file
        dislayed_file = null
        if (f) {
            console.log(`file selected: ${f.full_name}`)
            setTimeout(() => {
                dislayed_file = f
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            }, 0)
        }
    })


</script>

<div class='flex flex-col'>
    <Header/>
    <main class='flex flex-row items-start'>
        <div class='wr-sidebar bg-slate-800'>
            <ul class='p-5'>
                {#each $files as file}
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
            {#if dislayed_file}
                <Editor file={dislayed_file} index='{index}' open_page='{manifestFile}' />
            {/if}
        </div>
    </main>
</div>

<style lang='scss'>
</style>
