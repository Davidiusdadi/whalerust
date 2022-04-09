import { Annotation, Extension, Transaction } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/basic-setup'
import type { Text } from '@codemirror/text'


let view_id_counter = 1
const syncAnnotation = Annotation.define<number>()
export type WREditorView = EditorView & {
    disconnect: () => void
}

export function giveC6({ elem, view_pool, doc, extensions }: {
    view_pool: WREditorView[],
    elem: Element,
    doc: string | Text,
    extensions: Extension[]
}) {
    const view_id = view_id_counter++
    const dispatch = (tr: Transaction) => {
        const who_anno = tr.annotation(syncAnnotation)
        own_view.update([tr])
        if (!who_anno) {
            if (tr.changes.empty) {
                return
            }
            for (const view of view_pool) {
                if (view === own_view) {
                    continue
                }
                view.dispatch({
                    changes: tr.changes,
                    annotations: syncAnnotation.of(view_id)
                })
            }
        }
    }

    const own_view: WREditorView = Object.assign(new EditorView({
        state: EditorState.create({
            doc,
            extensions
        }),
        parent: elem,
        dispatch
    }), {
        disconnect: () => {
            const index = view_pool.indexOf(own_view)
            if (index) {
                view_pool.splice(index, 1)
            }
        }
    })

    view_pool.push(own_view)
    return own_view
}