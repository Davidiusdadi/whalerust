import { Decoration, DecorationSet, EditorView, PluginValue, Range, ViewPlugin, ViewUpdate } from '@codemirror/view'
import type { EphemeralDecoration, SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import { decorateFromSyntaxTree } from 'src/lang/decorations/decoration_helper'
import anchor_and_image_decorator from 'src/lang/decorations/ephemeral/anchor_and_image'
import EmphasisMark from 'src/lang/decorations/ephemeral/EmphasisMark'
import StrongEmphasis from 'src/lang/decorations/ephemeral/StrongEmphasis'
import CodeMark from 'src/lang/decorations/ephemeral/CodeMark'
import HeaderMark from 'src/lang/decorations/ephemeral/HeaderMark'
import HorizontalRule from 'src/lang/decorations/ephemeral/HorizontalRule'
import list_as_block from 'src/lang/decorations/ephemeral/list_as_block'
import type { SelectionRange } from '@codemirror/state'


/**
 * Disables decorations when they come in contact with the cursor
 **/
export const EmphemeralPlugin = ViewPlugin.fromClass(class EmphemeralPluginCLS implements PluginValue {
    decorators: SyntaxTreeDecorationDefinition[] = [
        anchor_and_image_decorator,
        CodeMark,
        EmphasisMark,
        HeaderMark,
        HorizontalRule,
        list_as_block,
        StrongEmphasis
    ]

    deco: EmphemeralDecorationSet

    constructor(view: EditorView) {
        this.deco = new EmphemeralDecorationSet()
        this.deco.set(decorateFromSyntaxTree(view, this.decorators))
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.deco.set(decorateFromSyntaxTree(update.view, this.decorators))
        }
        this.deco.update(update.state.selection.ranges)
    }
}, {
    decorations: v => v.deco.decorations
})

export class EmphemeralDecorationSet {
    decorations: DecorationSet = Decoration.none
    private hidden_decorations = new Set<Range<Decoration>>()

    set(set: DecorationSet) {
        this.decorations = set
        this.hidden_decorations.clear()
    }


    update(ranges: readonly SelectionRange[]) {
        for (const r of ranges) {
            for (const d of this.hidden_decorations) {
                if (r.from < d.from || r.from > d.to) {
                    this.hidden_decorations.delete(d)
                    this.decorations = this.decorations.update({
                        add: [d.value.range(d.from, d.to)]
                    })
                }
            }

            const rem_set: Decoration[] = []
            this.decorations.between(r.from, r.to, (f, t, v) => {
                if ((v.spec as EphemeralDecoration).ephemeral === false) {
                    return
                }
                rem_set.push(v)
                this.hidden_decorations.add({
                    value: v,
                    from: f,
                    to: t
                })
                return
            })
            if (rem_set) {
                this.decorations = this.decorations.update({
                    filter: (f, t, value) => {
                        return !rem_set.includes(value)
                    }
                })
            }
        }
    }
}