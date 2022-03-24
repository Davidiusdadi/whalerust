<script lang='ts'>
    import WindowClose from 'svelte-material-icons/WindowClose.svelte'
    import { size } from '../store/defaults'

    export let show: boolean
</script>

<svelte:window on:keydown={(e) => { show = show ? e.keyCode !== 27 : show } } />

{#if show === true}
    <div
        on:click|self|stopPropagation={() => show = false}
        class='wr-backdrop absolute bg-opacity-70 bg-white z-50 inset-0 flex justify-center items-center'>
        <div class='bg-white border-4 border-slate-400 rounded-lg'>
            <slot name='title-bar'>
                <div class='bg-slate-400 flex justify-end items-center'>
                    <div on:click|stopPropagation={() => show = false}>
                        <WindowClose size='{size}' />
                    </div>
                </div>
            </slot>
            <slot></slot>
        </div>
    </div>
{/if}