import { File } from 'src/db/file'
import { NodeNames, whalerust_parser } from 'src/lang/parser'

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
