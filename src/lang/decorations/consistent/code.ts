import { Decoration } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'
import type { Range } from '@codemirror/rangeset'

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name === NodeNames.FencedCode) {
                const line_from = view.state.doc.lineAt(from).number
                const line_to = view.state.doc.lineAt(to).number
                const ranges: Range<Decoration>[] = []
                for (let i = line_from; i <= line_to; i++) {
                    const line = view.state.doc.line(i).from
                    const cls = `wp-code-text${i === line_from ? ' wp-fist-child' : ''}${i === line_to ? ' wp-last-child' : ''}`
                    console.log('class:', i, line_from, line_to, cls)
                    ranges.push(Decoration.line({
                        class: cls
                    }).range(line))
                }
                return ranges
            } else if (type.name === NodeNames.InlineCode) {
                const deco = Decoration.mark({
                    class: 'wp-inline-code'
                })
                return [deco.range(from, to)]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition