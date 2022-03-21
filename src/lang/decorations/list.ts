import { WidgetType } from '@codemirror/view'
import { EditorView, Decoration, Range } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view'

class ListMarkWidget extends WidgetType {
    constructor(readonly checked: boolean) {
        super()
    }

    eq(_widget: WidgetType): boolean {
        return true
    }

    toDOM() {
        let wrap = document.createElement('span')
        wrap.setAttribute('aria-hidden', 'true')
        wrap.className = 'wr-list-mark-decoration'
        return wrap
    }

    ignoreEvent() {
        return false
    }
}


function ListMarkDecoration(view: EditorView) {
    let widgets: Range<Decoration>[] = []
    for (let { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from, to,
            enter: (type, from, to) => {
                if (type.name == 'ListMark' && (to - from) === 1) {
                    let isTrue = view.state.doc.sliceString(from, to) == 'true'
                    let deco = Decoration.replace({
                        widget: new ListMarkWidget(isTrue),
                        block: false,
                        inclusive: false,
                        inclusiveEnd: false,
                        inclusiveStart: false
                    })
                    widgets.push(deco.range(from, to))
                }
            }
        })
    }
    return Decoration.set(widgets)
}


export const ListMarkDecorationPlugin = ViewPlugin.fromClass(class {
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