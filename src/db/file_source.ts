import loadRoamData from 'src/db/roam-loader'
import loadMdData from 'src/db/markdown-loader'
import type { File } from './file'


export class Source {
    readonly full_url: string
    readonly name: string
    readonly local: boolean
    files: File[] = []

    content_raw(): string {
        return ''
    }

    constructor(full_url: string) {
        this.full_url = full_url
        this.local = this.full_url.toLowerCase().startsWith('file://')

        const url_matcher = full_url.match(/([^/]+\.(?:md|json))(?:[?#]|$)/)
        this.name = full_url
        if (url_matcher) {
            this.name = url_matcher[0]
        }
    }

    initRawContent(c: string) {
        if (this.name.toLowerCase().endsWith('.json')) {
            this.content_raw = () => c
            this.files = loadRoamData(this, c)
        } else if (this.name.toLowerCase().endsWith('.md')) {

            const res = loadMdData(this, this.name, c)
            this.content_raw = () => res[0].content
            this.files = res
        } else {
            throw Error(`no loader for: ${this.name}`)
        }
        return this
    }

}