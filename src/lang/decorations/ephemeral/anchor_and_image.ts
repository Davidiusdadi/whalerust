import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import { Decoration, WidgetType } from '@codemirror/view'
import { NodeNames } from 'src/lang/parser'
import type { EditorView } from '@codemirror/basic-setup'

const ImageLabelRegex = /^(.+)\|(?:(\d+)|(\d+)x(\d+))/


abstract class LinkType extends WidgetType {
    readonly src: string
    readonly label: string

    constructor(src: string, label: string) {
        super()
        this.src = src
        this.label = label
    }

    eq(_widget: LinkType): boolean {
        return _widget.src === this.src && _widget.label === this.label
    }
}

class AnchorLink extends LinkType {
    constructor(src: string, label: string) {
        super(src, label)
    }

    toDOM() {
        const a = document.createElement('a')
        a.setAttribute('href', this.src)
        a.target = '_blank'
        a.innerText = this.label
        return a
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


export default ((view: EditorView) => {
    let list_marks: [number, number][] = []
    let is_image = false
    let mark_line = 0
    const doc = view.state.doc

    return {
        enter(type, from, to) {
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
                    const mark = deco.range(list_marks[0][0], list_marks[3][1])
                    list_marks = []
                    return [mark]
                }
            }
        }
    }
}) as SyntaxTreeDecorationDefinition