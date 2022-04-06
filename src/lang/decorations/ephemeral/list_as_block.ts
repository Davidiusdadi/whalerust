import { Decoration, Range, WidgetType } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'
import type { EphemeralDecoration } from 'src/lang/decorations/decoration_helper'
import HTMLElem from 'src/lang/decorations/GenericWIdget'


class IndentStripes extends WidgetType {
    depth: number
    cls: string

    constructor(depth: number, cls: string) {
        super()
        this.depth = depth
        this.cls = cls
    }

    toDOM(view: EditorView): HTMLElement {
        const wrap = document.createElement('span')
        for (let i = 0; i < this.depth; i++) {
            const tick = document.createElement('span')
            tick.className = `tick ${this.cls}`
            tick.setAttribute('style', `--data-depth: ${i + 1};`)
            wrap.appendChild(tick)
        }
        return wrap

    }
}



export default ((view: EditorView) => {
    const range: Range<Decoration>[] = []

    let depth = 0
    let list_type: 'BulletList' | 'OrderedList' = 'OrderedList'
    let list_mark_i = 0

    const doc = view.state.doc

    const list_line_stripe_depth: number[] = []
    const list_line_stripe_render: (boolean | undefined)[] = []

    const indent_style = (indent_style = '•') => {
        if (indent_style) {
            if (['+', '-', '*'].includes(indent_style)) {
                indent_style = '•'
            }
        }
        return indent_style
    }

    const lead_space = (line: string) => {
        let i = 0
        for (; i < line.length; i++) {
            if (line[i] != ' ') {
                break
            }
        }
        return i
    }

    const indent_list_line = (from: number, depth: number) => {
        const line = doc.lineAt(from)
        const mark = (Decoration.line({
            class: 'wp-list-line wp-list-indented',
            attributes: {
                'style': `--data-depth: ${depth};`
            },
            ephemeral: false
        }) as EphemeralDecoration).range(line.from)
        range.push(mark)
    }

    return {
        leave(type): Range<Decoration>[] | void {
            if (type.name == NodeNames.ListItem) {
                depth--
            }
        },
        enter(type, from, to) {
            if (type.name == 'BulletList') {
                list_type = 'BulletList'
            } else if (type.name == 'OrderedList') {
                list_type = 'OrderedList'
            } else if (type.name === 'ListItem') {
                list_mark_i = 0
                depth++

                const line_start = doc.lineAt(from).number

                list_line_stripe_depth[line_start] = depth
                list_line_stripe_render[line_start] = false
                const line_end = doc.lineAt(to).number
                const line_span = line_end - line_start
                if (line_span > 0) {
                    for (let i = line_start + 1; i <= line_end; i++) {
                        list_line_stripe_depth[i] = depth
                        list_line_stripe_render[i] = (list_line_stripe_render[i] ?? true)
                    }
                }
            } else if (type.name === 'ListMark') {
                list_mark_i++
                if (list_mark_i === 1) {
                    const line = doc.lineAt(from)
                    list_line_stripe_render[line.number] = false

                    let mark = Decoration.widget({
                        widget: new IndentStripes(depth, 'wp-skip-first'),
                        side: -1
                    }).range(from)
                    mark.value.startSide = -2
                    range.push(mark)

                    mark = Decoration.replace({
                        widget: new HTMLElem('span', (e) => {
                            e.setAttribute('wp-list-mark', indent_style(doc.sliceString(from, to)))
                        })
                    }).range(from, to)
                    mark.value.startSide = -1
                    range.push(mark)
                    doc.sliceString(from, to)
                }
            } else {
                return
            }
        },
        after() {
            for (const line_num_s of Object.keys(list_line_stripe_depth)) {
                const line_num = parseInt(line_num_s)
                const line = doc.line(line_num)
                let depth = list_line_stripe_depth[line_num]

                const has_mark = list_line_stripe_render[line_num]

                if (has_mark) {
                    let ref_depth = 0
                    for (let i = line_num - 1; list_line_stripe_render[i] !== undefined; i--) {
                        if (list_line_stripe_render[i] === false) {
                            ref_depth = list_line_stripe_depth[i]!
                            break
                        }
                    }
                    depth = ref_depth


                    const mark = Decoration.widget({
                        widget: new IndentStripes(depth, ''),
                        side: 2
                    }).range(line.from)
                    mark.value.startSide = 4
                    range.push(mark)
                }

                indent_list_line(line.from, depth)
                const lead = lead_space(line.text)
                if (lead > 0) {
                    const mark = Decoration.replace({}).range(line.from, line.from + lead)
                    mark.value.startSide = 10
                    range.push(mark)
                }
            }
            return range
        }
    }
}) as SyntaxTreeDecorationDefinition