import type { File } from 'src/db/file'
import { NodeNames, whalerust_parser } from 'src/lang/parser'

class FileRef {
    readonly from: string
    readonly to: string

    constructor(from: string, to: string) {
        this.from = from
        this.to = to
    }
}

/** Describes block that is referencable as it has an id https://help.obsidian.md/How+to/Link+to+blocks */
interface BlockRef {
    /** The file in which this referenable block can be founc  */
    file: File
    /** start of the block */
    from: number
    /** eof of the block */
    to: number
     /** eof of the block yet w/o the trailing block-id*/
    to_wo_ref: number
}

export class Index {
    page_refs: Set<FileRef> = new Set<FileRef>()
    pages: Set<File> = new Set<File>()
    block_refs: {
        [ref: string]: BlockRef
    } = {}

    constructor() {
        //
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
        const content = file.content()
        const tree = whalerust_parser.parse(content)
        const tc = tree.fullCursor()

        while (tc.next(true)) {
            if (tc.name === NodeNames.WikiLink) {
                const link_to = file.content().slice(tc.from + 2, tc.to - 2) // cutting away the brackets [[link_to]]
                this.page_refs.add(new FileRef(file.name_short, link_to))
            } else if (tc.name === NodeNames.BlockIdValue) {
                const block_id = content.slice(tc.from, tc.to)
                const block = tc.node.parent!.parent!
                this.block_refs[block_id] = {
                    file,
                    from: block.from,
                    to: block.to,
                    to_wo_ref: tc.node.prevSibling!.from - 1 // cut off space and ^
                }
            }
        }
    }
}
