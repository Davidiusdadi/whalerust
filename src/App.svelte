<script lang="ts">
    import {onMount} from "svelte"
    import * as rust from '../whale_rust_wasm/pkg'
    import type {} from '../whale_rust_wasm/pkg'
    import {RoamPage} from "../common/bindings/RoamPage"
    import Page from "src/svelte/Page.svelte"

    onMount(() => {
        //rust.greet()
    })


    const data = (async () => {
        const resp = await fetch('/api/dump')
        return resp.json() as Promise<RoamPage[]>
    })()


</script>

<main>
    {#await data}
        <p>...loading data</p>
    {:then data}
        <p>all loaded !</p>
        <ul>
            {#each data as page}
                <li>
                    <Page page="{page}"/>
                </li>
            {/each}
        </ul>
    {:catch e}
        <p>...failed to load</p>
    {/await}
</main>

<style lang="scss">
</style>
