import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name === NodeNames.CodeMark) {
                return [Decoration.replace({}).range(from, to)]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition