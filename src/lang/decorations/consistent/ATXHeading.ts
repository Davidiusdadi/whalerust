import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name.startsWith('ATXHeading') || type.name.startsWith('SetextHeading')) {
                const deco = Decoration.mark({
                    class: `wp-heading wp-heading-${type.name}`
                })
                const line_from_end = view.state.doc.lineAt(from).to
                const line_to_end = view.state.doc.lineAt(to).to
                return [deco.range(from, Math.min(line_from_end, line_to_end))]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition