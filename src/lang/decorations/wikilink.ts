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
                            target: '_blank',
                            role: 'link',
                            title: `open: ${href}`
                        }
                    })
                    widgets.push(deco.range(from, to))
                } else if (type.name === NodeNames.FencedCode) {
                    const line_from = view.state.doc.lineAt(from).number
                    const line_to = view.state.doc.lineAt(to).number
                    for (let i = line_from; i <= line_to; i++) {
                        const line = view.state.doc.line(i).from
                        const cls = `wp-code-text${i === line_from ? ' wp-fist-child' : ''}${i === line_to ? ' wp-last-child' : ''}`
                        console.log('class:', i, line_from, line_to, cls)
                        widgets.push(Decoration.line({
                            class: cls
                        }).range(line))
                    }

                } else if (type.name === NodeNames.InlineCode) {
                    const deco = Decoration.mark({
                        class: 'wp-inline-code'
                    })
                    widgets.push(deco.range(from, to))
                } else if (type.name.startsWith('ATXHeading')) {
                    const deco = Decoration.line({
                        class: `wp-heading-${type.name}`
                    })
                    widgets.push(deco.range(view.state.doc.lineAt(from).from))
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