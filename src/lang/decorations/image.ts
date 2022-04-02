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

abstract class LinkType extends WidgetType {
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
}

class ImageWidget extends LinkType {
    constructor(src: string, label: string) {
        super(src, label)
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
}

class AnchorLink extends LinkType {
    constructor(src: string, label: string) {
        super(src, label)
    }

    toDOM() {
        const a = document.createElement('a') as HTMLAnchorElement
        a.setAttribute('href', this.src)
        a.target = '_blank'
        a.innerText = this.label
        return a
    }
}

class HTMLHRElementWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        return document.createElement('hr')
    }
}

function ImageDecoration(view: EditorView, ranges = view.visibleRanges) {
    const widgets: Range<Decoration>[] = []
    for (const { from, to } of ranges) {
        let list_marks: [number, number][] = []
        let is_image = false
        let mark_line = 0

        const doc = view.state.doc

        syntaxTree(view.state).iterate({
            from, to,
            enter: (type, from, to) => {
                if (type.name == NodeNames.LinkMark) {
                    const line = doc.lineAt(from)
                    const line_num = line.number
                    if (list_marks.length === 0) {
                        const char = doc.sliceString(from, to)
                        is_image = '![' === char
                        if (char === ']' || char === ':') {
                            console.log('bad entry:', doc.sliceString(line.from, line.to))
                            return
                        }
                        mark_line = line_num
                        console.log('gather:', char, 'at', mark_line)
                    } else if (line_num !== mark_line) {
                        console.log('multi line bad:', doc.sliceString(line.from, line.to), line_num, mark_line)
                        list_marks = []
                        return
                    }
                    list_marks.push([from, to])

                    if (list_marks.length === 2) {
                        const next_char = doc.sliceString(to, to + 1)
                        if (next_char !== '(') { // skip foot-note link references
                            console.log('skip link ', doc.sliceString(list_marks[0][0], to + 1))
                            list_marks = []
                        }
                    }
                    if (list_marks.length === 4) {
                        console.log('ImageDecoration:', doc.sliceString(list_marks[0][0], list_marks[3][1]))
                        const deco = Decoration.replace({
                            widget: new (is_image ? ImageWidget : AnchorLink)(
                                doc.sliceString(list_marks[2][1], list_marks[3][0]),
                                doc.sliceString(list_marks[0][1], list_marks[1][0])
                            )
                        })
                        widgets.push(deco.range(list_marks[0][0], list_marks[3][1]))
                        list_marks = []
                    }
                } else if (type.name === NodeNames.EmphasisMark) {
                    const mark = Decoration.replace({}).range(from, to)
                    mark.value.startSide = 0
                    widgets.push(mark)
                } else if (type.name === NodeNames.StrongEmphasis) {
                    const mark = Decoration.mark({
                        class: 'wr-strong'
                    }).range(from, to)
                    mark.value.startSide = 1
                    widgets.push(mark)
                } else if (type.name === NodeNames.HeaderMark) {
                    const mark = Decoration.replace({}).range(from, to + 1)
                    widgets.push(mark)
                } else if (type.name == NodeNames.HorizontalRule) {
                    //const line =  doc.lineAt(from)
                    widgets.push(Decoration.replace({
                        widget: new HTMLHRElementWidget()
                    }).range(from, to))
                } else if (type.name === NodeNames.CodeMark) {
                    widgets.push(Decoration.replace({}).range(from, to))
                }
            }
        })
    }
    return Decoration.set(widgets, true)
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