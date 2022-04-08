import { DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { decorateFromSyntaxTree, SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import ATXHeading from 'src/lang/decorations/consistent/ATXHeading'
import code from 'src/lang/decorations/consistent/code'
import HashText from 'src/lang/decorations/consistent/HashText'
import InlineURL from 'src/lang/decorations/consistent/InlineURL'
import WikiLink from 'src/lang/decorations/consistent/WikiLink'
import list_as_block from 'src/lang/decorations/ephemeral/list_as_block'
import debug from 'src/lang/decorations/consistent/debug'
import BlockId from 'src/lang/decorations/consistent/BlockId'

export const ConsistentPlugin = ViewPlugin.fromClass(class ConsistentPluginCLS implements PluginValue {
    decorators: SyntaxTreeDecorationDefinition[] = [
        ATXHeading,
        code,
        HashText,
        InlineURL,
        WikiLink,
        BlockId
        // debug
    ]
    decorations: DecorationSet

    constructor(view: EditorView) {
        this.decorations = decorateFromSyntaxTree(view, this.decorators)
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = decorateFromSyntaxTree(update.view, this.decorators)
        }
    }
}, {
    decorations: v => v.decorations
})