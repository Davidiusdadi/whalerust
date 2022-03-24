import type { Source } from 'src/db/file_source'

export class File {
    readonly source: Source
    readonly name: string
    readonly content: string
    readonly date: number

    readonly name_short: string

    get full_name() {
        return this.name
    }

    getLastModified() {
        return new Date(this.date).toLocaleDateString()
    }

    constructor({ name, content, date, source }: {
        name: string,
        content: string,
        source: Source,
        date?: number
    }) {
        this.name = name
        this.content = content
        this.date = date ?? Date.now()
        this.source = source
        this.name_short = this.name.replace(/\.[^.]+$/, '')
    }
}