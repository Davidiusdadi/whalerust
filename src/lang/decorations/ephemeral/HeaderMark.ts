import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name === NodeNames.HeaderMark) {
                const mark = Decoration.replace({}).range(from, to + 1)
                return [mark]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition