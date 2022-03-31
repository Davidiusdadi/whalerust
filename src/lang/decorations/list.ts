import { PluginValue, WidgetType } from '@codemirror/view'
import { EditorView, Decoration, Range } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view'

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

    constructor(depth: number) {
        super()
        this.depth = depth
    }

    toDOM(view: EditorView): HTMLElement {
        const wrap = document.createElement('span')
        for (let i = 0; i < this.depth; i++) {
            const tick = document.createElement('span')
            tick.className = 'tick'
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
    syntaxTree(state).iterate({
        leave(type, from, to) {
            if (type.name == 'ListItem') {
                depth--
            }

        },
        enter: (type, from, to) => {
            // OrderedList
            if (type.name == 'BulletList') {
                list_type = 'BulletList'
            } else if (type.name == 'OrderedList') {
                list_type = 'OrderedList'
            } else if (type.name === 'ListItem') {
                list_mark_i = 0
                depth++
                {
                    const line = state.doc.lineAt(from)
                    const mark = Decoration.line({
                        class: 'wp-list-line',
                        attributes: {
                            'x-data-depth': depth.toString(),
                            'x-data-list-type': list_type,
                            'style': `--data-depth: ${depth};`
                        }
                    }).range(line.from, line.from)
                    mark.value.startSide = 1
                    widgets.push(mark)
                }
            } else if (type.name === 'ListMark') {
                list_mark_i++
                if (list_mark_i === 1) {
                    const line = state.doc.lineAt(from)
                    {
                        const mark = Decoration.replace({
                            widget: new IndentStripes(depth)
                        }).range(line.from, to)
                        mark.value.startSide = 2
                        widgets.push(mark)
                    }
                }

            } else {
                return
            }
            console.log(`${' '.repeat(depth)}${type.name} -- ${state.doc.sliceString(from, to)}`)

        }
    })
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