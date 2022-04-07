import { EditorView, Decoration, DecorationSet, Range, WidgetType } from '@codemirror/view'
import { StateField, StateEffect, EditorSelection } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import HTMLElem from 'src/lang/decorations/GenericWIdget'
import type { SyntaxNode } from '@lezer/common/dist/tree'
import type { EditorState } from '@codemirror/basic-setup'
import Editor, { editor_modes } from 'src/lang/editor'
import type { NodeType } from '@lezer/common/dist/tree'

type ReplaceDecorationSpec = Parameters<(typeof Decoration)['replace']>[0]

function createTableWidget(s: EditorState, on_focus: (w: WidgetType, view: EditorView) => void) {
    const tables: Range<Decoration>[] = []
    syntaxTree(s).iterate({
        enter: (type, from, to, get) => {
            if (type.name === 'Table') {
                const sy = get()
                //effects.push(table_mark.of({ from, to }))
                const table = Decoration.replace({
                    widget: new HTMLElem('table', (t, w, view) => {
                        t.addEventListener('click', () => on_focus(w, view))

                        const t_h = sy.firstChild!
                        const process_cell = (node: SyntaxNode, el: 'td' | 'th') => {
                            if (node.type.name === 'TableCell') {
                                const cell = document.createElement(el)

                                Editor(cell, s.doc.sliceString(node.from, node.to), editor_modes['table_cell'](), [])
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
            const drop_deco: Decoration[] = []
            if (focused_widget) {
                const iter = decorations.iter()
                for (; ;) {
                    const deco = iter.value
                    if (deco === null) {
                        break
                    }
                    if (focused_widget === (deco.spec as ReplaceDecorationSpec).widget) {
                        drop_deco.push(deco)
                        focused_widget = null
                        setTimeout(() => {
                            view.focus()
                            view.dispatch({
                                selection: EditorSelection.cursor(iter.from)
                            })
                        })
                        break
                    }
                }
            }

            if (tr.selection) {
                for (const range of tr.selection.ranges) {
                    const line_from = doc.lineAt(range.from)
                    const line_to = doc.lineAt(range.to)
                    const line_before = line_from // line_from.number > 1 ? doc.line(line_from.number - 1) : line_from
                    const line_after = line_to // line_to.number < doc.lines ? doc.line(line_from.number + 1) : line_to

                    decorations.between(line_before.from, line_after.to, (from, to, deco) => {
                        drop_deco.push(deco)
                    })
                }

                tables_visible = decorations.update({
                    filter: (from, to, deco) => {
                        return !drop_deco.includes(deco)
                    }
                })
            }

            if (tr.docChanged) {
                let recalc = false
                tr.changes.iterChanges((fromA, toA, fromB, toB) => {
                    if (recalc) {
                        return
                    }
                    const line = tr.state.doc.lineAt(fromB)
                    const next_line = tr.state.doc.lines > line.number ? tr.state.doc.line(line.number + 1) : line

                    decorations.between(fromB, toB, (from, to, deco) => {
                        if (!drop_deco.includes(deco)) {
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
                            if (line.from <= from && next_line.to >= to) { // the syntaxTree does not seem to respect our from/to exactly
                                if (type.name.startsWith('Table')) {
                                    recalc = true
                                    return false
                                }
                            }
                        }
                    })
                })
                if (recalc) {
                    console.log('recalc createTableWidget')
                    decorations = createTableWidget(tr.state, on_focus)
                }
            }
            return tables_visible
        },
        provide: f => EditorView.decorations.from(f)
    })

}