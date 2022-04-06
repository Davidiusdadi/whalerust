import { EditorView, Decoration, DecorationSet, Range } from '@codemirror/view'
import { StateField, StateEffect } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import HTMLElem from 'src/lang/decorations/GenericWIdget'
import type { SyntaxNode } from '@lezer/common/dist/tree'
import type { EditorState } from '@codemirror/basic-setup'
import Editor, { editor_modes } from 'src/lang/editor'
import type { NodeType } from '@lezer/common/dist/tree'


const table_mark = StateEffect.define<{ from: number, to: number }>()

function createTableWidget(s: EditorState) {
    const tables: Range<Decoration>[] = []
    const effects: StateEffect<any>[] = []
    syntaxTree(s).iterate({
        enter: (type, from, to, get) => {
            if (type.name === 'Table') {
                const sy = get()
                //effects.push(table_mark.of({ from, to }))
                const table = Decoration.replace({
                    widget: new HTMLElem('table', (t) => {
                        console.log('table: ', sy)
                        const t_h = sy.firstChild!
                        console.log('t_h', t_h)

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
    s.update({
        effects
    })
    return Decoration.set(tables)
}

export const table_marker = StateField.define<DecorationSet>({
    create(s) {
        return createTableWidget(s)//Decoration.none
    },
    update(tables, tr) {
        if (tr.docChanged) {
            tables = tables.map(tr.changes)
            console.log('changes', tr.changes)
            let recalc = false
            tr.changes.iterChanges((fromA, toA, fromB, toB) => {
                if (recalc) {
                    return
                }
                const line = tr.state.doc.lineAt(fromB)
                const next_line = tr.state.doc.lines > line.number ? tr.state.doc.line(line.number + 1) : line

                tables.between(fromB, toB, () => {
                    recalc = true
                    return false
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
                tables = createTableWidget(tr.state)
            }
        }
        return tables
    },
    provide: f => EditorView.decorations.from(f)
})

