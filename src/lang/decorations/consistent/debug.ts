import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'

export default ((view: EditorView) => {
    let depth = 1
    return {
        leave() {
            depth--
        },
        enter(type, from, to) {
            console.log(`${' '.repeat(depth)}${type.name}`, view.state.doc.sliceString(from, to))
            depth++
        }
    }
}) as SyntaxTreeDecorationDefinition