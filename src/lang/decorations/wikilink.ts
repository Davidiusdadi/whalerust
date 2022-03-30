import { Decoration, DecorationSet, EditorView, PluginValue, Range, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { NodeNames } from 'src/lang/parser'


function WikiLinkDecoration(view: EditorView) {
    const widgets: Range<Decoration>[] = []
    for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from, to,
            enter: (type, from, to) => {
                if (type.name == NodeNames.WikiLink) {
                    const deco = Decoration.mark({
                        attributes: {
                            'x-data-target': view.state.doc.sliceString(from + 2, to - 2)
                        }
                    })
                    widgets.push(deco.range(from, to))
                } else if (type.name === NodeNames.HashText) {
                    const deco = Decoration.mark({
                        attributes: {
                            'x-data-target': view.state.doc.sliceString(from, to)
                        }
                    })
                    widgets.push(deco.range(from - 1, to)) // include the leading #
                } else if (type.name === NodeNames.InlineURL) {
                    const href = view.state.doc.sliceString(from, to)
                    const deco = Decoration.mark({
                        tagName: 'a',
                        attributes: {
                            href,
                            target:"_blank",
                            role:"link",
                            title: `open: ${href}`
                        },
                    })
                    widgets.push(deco.range(from, to))
                }
            }
        })
    }
    return Decoration.set(widgets)
}

export const WikiLinkDecorationPlugin = ViewPlugin.fromClass(class ListMarkDecorationPluginCLS implements PluginValue {
    decorations: DecorationSet

    constructor(view: EditorView) {
        this.decorations = WikiLinkDecoration(view)
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = WikiLinkDecoration(update.view)
        }
    }
}, {
    decorations: v => v.decorations
})