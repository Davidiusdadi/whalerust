<script lang="ts">
    import {RoamPage} from "../../common/bindings/RoamPage"
    import Block from "./Block.svelte"

    export let page: RoamPage
</script>

<div class="border-10">
    <h2 class="text-3xl font-bold mb-5">{page.title}</h2>
    <ul class="list-disc m-5 bg-slate-100">
        {#if page.children}
            {#each page.children as child}
                <Block block='{child}' />
            {/each}
        {/if}
    </ul>
</div>