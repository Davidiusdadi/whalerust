import type { Source } from 'src/db/file_source'
import { giveC6, WREditorView } from 'src/lang/view'
import type { Extension } from '@codemirror/state'


export class File {
    readonly source: Source
    readonly name: string
    readonly date: number

    readonly name_short: string

    get full_name() {
        return this.name
    }

    getLastModified() {
        return new Date(this.date).toLocaleDateString()
    }

    content() {
        return ''
    }

    constructor({ name, content, date, source }: {
        name: string,
        content: string,
        source: Source,
        date?: number
    }) {
        this.name = name
        this.content = () => content
        this.date = date ?? Date.now()
        this.source = source
        this.name_short = this.name.replace(/\.[^.]+$/, '')
    }

    private pool: WREditorView[] = []
    giveC6(elem: Element, extensions: Extension[]) {
        return giveC6({
                elem,
                view_pool: this.pool,
                doc: this.pool.length > 0 ? this.pool[0].state.doc : this.content(),
                extensions
            }
        )
    }
}