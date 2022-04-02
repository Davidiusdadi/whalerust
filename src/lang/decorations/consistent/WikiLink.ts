import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name == NodeNames.WikiLink) {
                const deco = Decoration.mark({
                    attributes: {
                        'x-data-target': view.state.doc.sliceString(from + 2, to - 2)
                    }
                })
                return [deco.range(from, to)]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition