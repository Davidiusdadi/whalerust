import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginValue,
    Range,
    ViewPlugin,
    ViewUpdate,
    WidgetType
} from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { NodeNames } from 'src/lang/parser'


const ImageLabelRegex = /^(.+)\|(?:(\d+)|(\d+)x(\d+))/

class ImageWidget extends WidgetType {
    readonly src: string
    readonly label: string

    constructor(src: string, label: string) {
        super()
        this.src = src
        this.label = label
    }

    eq(_widget: ImageWidget): boolean {
        return _widget.src === this.src && _widget.label === this.label
    }

    toDOM() {
        const img = document.createElement('img')
        img.setAttribute('src', this.src)

        const match = ImageLabelRegex.exec(this.label)
        let label = this.label
        if (match) {
            label = match[1]
            if (match[2]) {
                img.setAttribute('x-data-width', match[2])
            } else {
                img.setAttribute('x-data-width', match[3])
                img.setAttribute('x-data-height', match[4])
            }
            img.setAttribute('title', label)
        }

        img.setAttribute('title', label)

        return img
    }

    ignoreEvent() {
        return false
    }
}

function ImageDecoration(view: EditorView, ranges = view.visibleRanges) {
    const widgets: Range<Decoration>[] = []
    for (const { from, to } of ranges) {
        let list_marks: [number, number][] = []
        syntaxTree(view.state).iterate({
            from, to,
            enter: (type, from, to) => {
                if (type.name == NodeNames.LinkMark) {
                    if (list_marks.length === 0 && '![' !== view.state.doc.sliceString(from, to)) {
                        return
                    }
                    list_marks.push([from, to])
                    if (list_marks.length % 4 === 0) {
                        console.log('ImageDecoration:', view.state.doc.sliceString(list_marks[0][0], list_marks[3][1]))
                        const deco = Decoration.replace({
                            widget: new ImageWidget(
                                view.state.doc.sliceString(list_marks[2][1], list_marks[3][0]),
                                view.state.doc.sliceString(list_marks[0][1], list_marks[1][0])
                            )
                        })
                        widgets.push(deco.range(list_marks[0][0], list_marks[3][1]))
                        list_marks = []
                    }
                }
            }
        })
    }
    return Decoration.set(widgets)
}

export const ImageDecorationPlugin = ViewPlugin.fromClass(class ImageDecorationPluginCLS implements PluginValue {
    decorations: DecorationSet
    hidden_decorations = new Set<Range<Decoration>>()

    constructor(view: EditorView) {
        this.decorations = ImageDecoration(view)
        this.hidden_decorations.clear()
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = ImageDecoration(update.view)
            this.hidden_decorations.clear()
        }

        for (const r of update.state.selection.ranges) {
            for (const d of this.hidden_decorations) {
                if (r.from < d.from || r.from > d.to) {
                    this.hidden_decorations.delete(d)
                    this.decorations = this.decorations.update({
                        add: [d.value.range(d.from, d.to)]
                    })
                }
            }

            const rem_set: Decoration[] = []
            this.decorations.between(r.from, r.to, (f, t, v) => {
                rem_set.push(v)
                this.hidden_decorations.add({
                    value: v,
                    from: f,
                    to: t
                })
                return
            })
            if (rem_set) {
                this.decorations = this.decorations.update({
                    filter: (f, t, value) => {
                        return !rem_set.includes(value)
                    }
                })
            }
        }
    }
}, {
    decorations: v => v.decorations
})