import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name === NodeNames.InlineURL) {
                const href = view.state.doc.sliceString(from, to)
                const deco = Decoration.mark({
                    tagName: 'a',
                    attributes: {
                        href,
                        target: '_blank',
                        role: 'link',
                        title: `open: ${href}`
                    }
                })
                return [deco.range(from, to)]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition