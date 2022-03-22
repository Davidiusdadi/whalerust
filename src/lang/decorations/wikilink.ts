import { Decoration, DecorationSet, EditorView, PluginValue, Range, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { NodeNames } from 'src/lang/parser'


function WikiLinkDecoration(view: EditorView) {
    let widgets: Range<Decoration>[] = []
    for (let { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from, to,
            enter: (type, from, to) => {
                if (type.name == NodeNames.WikiLink) {
                    let deco = Decoration.mark({
                        attributes: {
                            'x-data-target': view.state.doc.sliceString(from + 2, to - 2)
                        }
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