import { StateField } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, Range } from '@codemirror/view'


/** Only reveal the specified range of the document */
export default (from: number, to: number) => {
    return StateField.define<DecorationSet>({
        create(s) {
            const ranges: Range<Decoration>[] = []
            if(from != 0) {
                ranges.push(Decoration.replace({}).range(0, from))
            }
            if(to != s.doc.length) {
                ranges.push(Decoration.replace({}).range(to, s.doc.length))
            }
            return Decoration.set(ranges)

        },
        update(hidden, tr) {
            if (tr.changes) {
                hidden.map(tr.changes)
            }
            return hidden
        },
        provide: f => EditorView.decorations.from(f)
    })
}