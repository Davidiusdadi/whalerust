import { File } from './file'
import { NodeNames, whalerust_parser } from '../lang/parser'

class FileRef {
    readonly from: string
    readonly to: string

    constructor(from: string, to: string) {
        this.from = from
        this.to = to
    }
}

export class Index {
    page_refs: Set<FileRef> = new Set<FileRef>()
    pages: Set<File> = new Set<File>()

    constructor() {
    }

    getBackLinks(file: File) {
        const file_name = file.name_short
        const refs: FileRef[] = []
        for (const ref of this.page_refs.values()) {
            if (ref.to === file_name) {
                refs.push(ref)
            }
        }
        return refs
    }

    addFile(file: File) {
        this.pages.add(file)
        const tree = whalerust_parser.parse(file.content)
        const tc = tree.fullCursor()

        while (tc.next(true)) {
            if (tc.name === NodeNames.WikiLink) {
                const link_to = file.content.slice(tc.from + 2, tc.to - 2) // cutting away the brackets [[link_to]]
                this.page_refs.add(new FileRef(file.name_short, link_to))
            }
        }
    }
}
