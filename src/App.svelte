<script lang='ts'>
    import Editor from 'src/svelte/Editor.svelte'
    import type { File } from 'src/db/file'
    import Header from 'src/svelte/Header.svelte'
    import { index, file } from './store/core'


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
                })
            }, 0)
        }
    })


</script>

<div class='flex flex-col'>
    <Header />
    <main class='wr-main-doc flex lg:w-[700px] lg:m-auto'>
        <div class='wr-page-container flex flex-grow pl-5'>
            {#if dislayed_file}
                <Editor file={dislayed_file} index='{index}' />
            {/if}
        </div>
    </main>
</div>

<style lang='scss'>
</style>
