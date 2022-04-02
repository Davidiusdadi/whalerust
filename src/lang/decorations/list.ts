import { PluginValue, WidgetType } from '@codemirror/view'
import { EditorView, Decoration, Range } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view'
import { NodeNames } from 'src/lang/parser'

class ListMarkWidget extends WidgetType {

    eq(_widget: WidgetType): boolean {
        return true
    }

    toDOM() {
        const wrap = document.createElement('span')
        wrap.setAttribute('aria-hidden', 'true')
        wrap.className = 'wr-list-mark-decoration'
        return wrap
    }

    ignoreEvent() {
        return false
    }
}

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
        console.log('indent strips', this.depth)
        return wrap

    }
}

function ListMarkDecoration(view: EditorView) {
    const state = view.state

    const widgets: Range<Decoration>[] = []

    let depth = 0
    let list_type: 'BulletList' | 'OrderedList' = 'OrderedList'
    let list_mark_i = 0

    const doc = view.state.doc

    const list_line_stripe_depth: (number | undefined)[] = []
    const list_line_stripe_render: (boolean | undefined)[] = []

    const indent_list_line = (from: number, depth: number, indent_style = '•') => {
        const line = doc.lineAt(from)
        const mark = Decoration.line({
            class: 'wp-list-line',
            attributes: {
                'x-data-indent-style': indent_style,
                'x-data-depth': depth.toString(),
                'x-data-list-type': list_type,
                'style': `--data-depth: ${depth};`
            }
        }).range(line.from)
        mark.value.startSide = 1
        widgets.push(mark)
    }

    syntaxTree(state).iterate({
        leave(type, from, to) {
            if (type.name == NodeNames.ListItem) {
                depth--
            }
        },
        enter: (type, from, to, get) => {
            // OrderedList
            if (type.name == 'BulletList') {
                list_type = 'BulletList'
            } else if (type.name == 'OrderedList') {
                list_type = 'OrderedList'
            } else if (type.name === 'ListItem') {
                list_mark_i = 0
                depth++

                indent_list_line(from, depth)

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
                    {
                        const mark = Decoration.replace({
                            widget: new IndentStripes(depth, 'wp-skip-first')
                        }).range(line.from, to)
                        mark.value.startSide = 2
                        widgets.push(mark)
                    }
                }

            } else {
                return
            }
        }
    })

    console.log('list_line_stripe_depth', list_line_stripe_depth)
    for (const line_num_s of Object.keys(list_line_stripe_depth)) {
        const line_num = parseInt(line_num_s)
        const line = doc.line(line_num)

        if (list_line_stripe_render[line_num]) {
            let ref_depth = 0
            for (let i = line_num - 1; list_line_stripe_render[i] !== undefined; i++) {
                if (list_line_stripe_render[i] === false) {
                    ref_depth = list_line_stripe_depth[i]!
                    break
                }
            }

            depth = ref_depth

            if (line.from === line.to) {
                continue
            }

            indent_list_line(line.from, depth, ' ')

            let to = line.from
            const max = line.from + depth * 4
            for (; to <= line.to && to < max; to++) {
                if (line.text[to - line.from] !== ' ') {
                    break
                }
            }

            if (line.from === to) {
                continue
            }

            const mark = Decoration.replace({
                widget: new IndentStripes(depth, ''),

            }).range(line.from, to)
            mark.value.startSide = 2
            widgets.push(mark)
            console.log(`STRIPE ln:${line_num}, dh:${depth} :: ${doc.sliceString(line.from, line.to)}`)
        }

    }

    return Decoration.set(widgets, true)
}


export const ListMarkDecorationPlugin = ViewPlugin.fromClass(class ListMarkDecorationPluginCLS implements PluginValue {
    decorations: DecorationSet

    constructor(view: EditorView) {
        this.decorations = ListMarkDecoration(view)
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = ListMarkDecoration(update.view)
        }
    }
}, {
    decorations: v => v.decorations
})