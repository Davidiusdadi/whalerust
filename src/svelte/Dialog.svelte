<script lang="ts">
    import WindowClose from 'svelte-material-icons/WindowClose.svelte'
    import {size} from '../store/defaults'
    export let is_url_dialog_open: boolean
</script>

<svelte:window
    on:keydown={(e) => { is_url_dialog_open = is_url_dialog_open ? e.keyCode !== 27 : is_url_dialog_open } } />

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
           <slot></slot>
        </div>
    </div>
{/if}