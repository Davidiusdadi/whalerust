import { EditorView, Decoration, DecorationSet, Range, WidgetType } from '@codemirror/view'
import { StateField, EditorSelection } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import HTMLElem from 'src/lang/decorations/GenericWIdget'
import type { SyntaxNode } from '@lezer/common/dist/tree'
import type { EditorState } from '@codemirror/basic-setup'
import { editor_modes } from 'src/lang/editor'
import type { NodeType } from '@lezer/common/dist/tree'
import { giveC6 } from 'src/lang/view'

type ReplaceDecorationSpec = Parameters<(typeof Decoration)['replace']>[0]

function createTableWidget(s: EditorState, on_focus: (w: WidgetType, view: EditorView) => void) {
    const tables: Range<Decoration>[] = []
    syntaxTree(s).iterate({
        enter: (type, from, to, get) => {
            if (type.name === 'Table') {
                console.log('Table at', from)
                const sy = get()
                //effects.push(table_mark.of({ from, to }))
                const table = Decoration.replace({
                    widget: new HTMLElem('table', (t, w, view) => {
                        t.addEventListener('click', () => on_focus(w, view))
                        const t_h = sy.firstChild!
                        const process_cell = (node: SyntaxNode, el: 'td' | 'th') => {
                            if (node.type.name === 'TableCell') {
                                const cell = document.createElement(el)
                                giveC6({
                                    elem: cell,
                                    view_pool: [],
                                    doc: s.doc.sliceString(node.from, node.to),
                                    extensions: editor_modes['table_cell']()
                                })
                                return cell
                            }
                            return null
                        }

                        const process_row = (sy: SyntaxNode | null, el: 'td' | 'th') => {
                            const row = document.createElement('tr')
                            t.appendChild(row)
                            for (; ;) {
                                if (!sy) {
                                    break
                                }
                                const cell = process_cell(sy, el)
                                if (cell) {
                                    row.appendChild(cell)
                                }
                                sy = sy.nextSibling
                            }
                        }

                        process_row(t_h.firstChild, 'th')
                        const t_del = t_h.nextSibling!
                        let t_row = t_del.nextSibling
                        for (; ;) {
                            if (!t_row) {
                                break
                            }
                            process_row(t_row.firstChild, 'td')
                            t_row = t_row.nextSibling
                        }
                    })
                })

                tables.push(table.range(Math.max(0, from - 1), Math.min(to + 1, s.doc.length)))
            }
        }
    })
    return Decoration.set(tables)
}

export const table_marker = () => {
    let view: EditorView
    let focused_widget: WidgetType | null = null
    const on_focus = (w: WidgetType, v: EditorView) => {
        focused_widget = w
        view = v
        view.dispatch({}) // just trigger a state update
    }

    let decorations: DecorationSet = Decoration.none
    return StateField.define<DecorationSet>({
        create(s) {
            decorations = createTableWidget(s, on_focus)
            return decorations
        },
        update(tables_visible, tr) {
            const doc = tr.state.doc
            decorations = decorations.map(tr.changes)
            let cursor_selected_decorations: Decoration[] = []
            if (focused_widget) {
                const iter = decorations.iter()
                for (; ;) {
                    const deco = iter.value
                    if (deco === null) {
                        break
                    }
                    if (focused_widget === (deco.spec as ReplaceDecorationSpec).widget) {
                        cursor_selected_decorations.push(deco)
                        focused_widget = null
                        setTimeout(() => {
                            view.focus()
                            view.dispatch({
                                selection: EditorSelection.cursor(iter.from)
                            })
                        })
                        break
                    }
                    iter.next()
                }
            }

            const filter_selection = () => {
                cursor_selected_decorations = []
                if (tr.selection) {
                    for (const range of tr.selection.ranges) {
                        const line_from = doc.lineAt(range.from)
                        const line_to = doc.lineAt(range.to)
                        const line_before = line_from // line_from.number > 1 ? doc.line(line_from.number - 1) : line_from
                        const line_after = line_to // line_to.number < doc.lines ? doc.line(line_from.number + 1) : line_to

                        decorations.between(line_before.from, line_after.to, (from, to, deco) => {
                            cursor_selected_decorations.push(deco)
                        })
                    }

                    tables_visible = decorations.update({
                        filter: (from, to, deco) => {
                            return !cursor_selected_decorations.includes(deco)
                        }
                    })
                }
            }
            filter_selection()

            if (tr.docChanged) {
                let recalc = false
                tr.changes.iterChanges((fromA, toA, fromB, toB) => {
                    if (recalc) {
                        return
                    }
                    const line_from = tr.state.doc.lineAt(fromB)
                    let line_to = tr.state.doc.lineAt(toB)
                    line_to = tr.state.doc.lines > line_to.number ? tr.state.doc.line(line_to.number + 1) : line_to

                    decorations.between(fromB, toB, (from, to, deco) => {
                        if (!cursor_selected_decorations.includes(deco)) {
                            recalc = true
                            return false
                        }
                    })

                    if (recalc) {
                        return
                    }

                    syntaxTree(tr.state).iterate({
                        from: fromB,
                        to: toB,
                        enter(type: NodeType, from: number, to: number, get: () => SyntaxNode): false | void {
                            if (type.name.startsWith('Table')) {
                                if (line_from.from <= from && line_to.to >= to) { // the syntaxTree does not seem to respect our from/to exactly
                                    recalc = true
                                    return false
                                }
                            }
                        }
                    })
                })
                if (recalc) {
                    console.log('recalc createTableWidget')
                    tables_visible = decorations = createTableWidget(tr.state, on_focus)
                    filter_selection()
                }
            }
            return tables_visible
        },
        provide: f => EditorView.decorations.from(f)
    })

}