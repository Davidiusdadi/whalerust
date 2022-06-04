import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name === NodeNames.BlockId) {
                const mark = Decoration.mark({
                    tagName: 'sup',
                    class: 'wr-BlockId'
                }).range(from, to)
                return [mark]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition