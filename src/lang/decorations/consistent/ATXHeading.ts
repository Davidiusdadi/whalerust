import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name.startsWith('ATXHeading') || type.name.startsWith('SetextHeading')) {
                const deco = Decoration.line({
                    class: `wp-heading wp-heading-${type.name}`
                })
                return [deco.range(view.state.doc.lineAt(from).from)]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition