import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { SyntaxNode } from '@lezer/common'
import { NodeNames } from './parser'
import { Index } from '../db/indexer'


export default function(index: Index) {
    function wiki_complete(context: CompletionContext): CompletionResult | null | Promise<CompletionResult | null> {
        let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1) as SyntaxNode

        let suggest_by: string
        let start_of_suggest: number
        let end_of_suggest: number

        console.log('cursor at:', nodeBefore.type.name)

        if (nodeBefore.type.name === NodeNames.WikiLinkMarkStart) {
            if (nodeBefore.to !== context.pos) {
                return null // cursor not at the end of [[
            }
            suggest_by = ''
            start_of_suggest = context.pos
            end_of_suggest = nodeBefore.nextSibling!.from
            console.log('WikiLinkMarkStart suggest', start_of_suggest, end_of_suggest)
        } else if (nodeBefore.type.name === NodeNames.WikiLink) {
            const wiki_link_mark_start_node = nodeBefore.firstChild!
            start_of_suggest = wiki_link_mark_start_node.to
            suggest_by = context.state.doc.sliceString(start_of_suggest, context.pos)

            const wiki_link_end_node = nodeBefore.lastChild!
            end_of_suggest = wiki_link_end_node.from

            console.log(`WikiLink suggest: ${suggest_by}, ${start_of_suggest}, ${end_of_suggest}`)
        } else {
            return null
        }

        if (suggest_by.length > 0) {
            console.log(`suggest_by: ${suggest_by}`)
            const options: Completion[] = []
            for (const [ref] of index.pages.entries()) {
                suggest_by = suggest_by.toLowerCase()
                if (ref.name_short.toLowerCase().startsWith(suggest_by)) {
                    options.push({
                        label: ref.name_short,
                        type: 'variable'
                    })
                }
            }

            if (options.length > 0) {
                const res: CompletionResult = {
                    from: start_of_suggest,
                    to: end_of_suggest,
                    options
                }
                console.log(`${options.length} suggestions`)
                return res
            } else {
                console.log('no suggestions available')
            }

            return null
        } else {
            console.log('empty suggest')
        }
        return null
    }

    return {
        wiki_complete
    }
}