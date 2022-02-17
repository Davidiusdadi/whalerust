<script lang="ts">
    import {RoamPage} from "../../common/bindings/RoamPage"
    import Block from "./Block.svelte"

    export let page: RoamPage
</script>

<div>
    <h2>{page.title}</h2>
    <ul>
        {#if page.children}
            {#each page.children as child}
                <Block block="{child}"/>
            {/each}
        {/if}
    </ul>
</div>