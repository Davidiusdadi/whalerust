<script lang="ts">
    import {RoamBlock} from "../../common/bindings/RoamBlock";
    import {parse_block} from '../../whale_rust_wasm/pkg'

    export let block: RoamBlock;

    let tokens = parse_block(block.string ?? '')

</script>

<li>
    {#each tokens as t}
        {#if t.type === 'Bold'}
            <span class="bold">{t.value}</span>
        {:else if t.type === 'Italic'}
            <span class="italic">{t.value}</span>
        {:else if t.type === 'Strikethrough'}
            <span class="strikethrough">{t.value}</span>
        {:else if t.type === 'Highlight'}`
            <span class="highlight">{t.value}</span>
        {:else if t.type === 'CodeInline'}
            <code>{t.value}</code>
        {:else if t.type === 'CodeEmbed'}
            <pre title="{t.lang}">{t.contents}</pre>
        {:else if t.type === 'PageRef' }
            {#if t.format === 'Normal'}
                <span class="bracket">[[</span>
                <span class="inner">{t.value}</span>
                <span class="bracket">]]</span>
            {:else if t.format === 'HashRef'}
                <span class="bracket">#[[</span>
                <span class="inner">{t.value}</span>
                <span class="bracket">]]</span>
            {:else if t.format === 'HashTag'}
                <span class="bracket">#</span>
                <span class="inner">{t.value}</span>
            {/if}
        {:else if t.type === 'BlockRef'}
            <span class="bracket">((</span>
            <span class="inner">{t.value}</span>
            <span class="bracket">))</span>
        {:else if t.type === 'Link'}
            <a href="{t.target}">{t.label}</a>
        {:else if t.type === 'Image'}
            <span class="bracket">![</span>
            <span class="inner">{t.label}</span>
            <span class="bracket">](</span>
            <span class="inner">{t.target}</span>
            <span class="bracket">)</span>
            <!-- <img src="{t.target}" title="{t.label}" alt="{t.label}" loading="lazy"/> -->
        {:else if t.type === 'Invocation'}
            <span class="bracket">{"{{"}</span>
            <span class="inner">{t.value}</span>
            <span class="bracket">{"}}"}</span>
        {:else if t.type === 'Plain'}
            {t.value}
        {:else }
            <span class="error">{t.type}</span>
        {/if}
    {/each}

    {#if block.children}
        <ul>
            {#each block.children as child}
                <svelte:self block={child}/>
            {/each}
        </ul>
    {/if}
</li>

<style lang="scss">
    .bold {
        font-weight: bold;
    }

    .italic {
        font-style: italic;
    }

    .bracket {
        color: gray;
    }

    .inner {
        color: dodgerblue;
    }

    .highlight {
        background-color: yellow;
    }

    .error {
        color: red;
    }

    .strikethrough {
        text-decoration: line-through;
    }
</style>