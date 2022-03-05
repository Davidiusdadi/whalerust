<script lang="ts">
    import {RoamPage} from "../../common/bindings/RoamPage"
    import Block from "./Block.svelte"

    export let page: RoamPage
</script>

<div class="border-2">
    <h2 class="text-3xl font-bold underline shadow-lg shadow-cyan-500/50">{page.title}</h2>
    <ul>
        {#if page.children}
            {#each page.children as child}
                <Block block='{child}' />
            {/each}
        {/if}
    </ul>
</div>