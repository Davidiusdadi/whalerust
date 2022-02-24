<script lang="ts">
    import {RoamBlock} from "../../common/bindings/RoamBlock";

    export let block: RoamBlock;
</script>

<li>
    {block.string}
    {#if block.children}
        <ul>
            {#each block.children as child}
                <svelte:self block={child}/>
            {/each}
        </ul>
    {/if}
</li>
