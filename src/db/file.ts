import type { Source } from 'src/db/file_source'

export class File {
    readonly name: string
    readonly source: Source
    readonly content: string
    readonly date: number


    get full_name() {
        return this.name
    }

    get name_short() {
        return this.name.replace(/\.[^.]+$/, '')
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
    }
}