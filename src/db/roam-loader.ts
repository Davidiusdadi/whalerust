import type { RoamBlock } from '../../common/bindings/RoamBlock'

import * as rust from '../../whale_rust_wasm/pkg'
import { File } from 'src/db/file'
import type { Source } from 'src/db/file_source'
import { tabSize } from 'src/store/defaults'

export default function loadRoamData(source: Source, roam_raw_data: string): File[] {
    const block_refs = new Set<string>()

    const ref_scan_block = (b: RoamBlock) => {
        b.refs?.forEach(r => block_refs.add(r.uid))
        b.children?.map(b => ref_scan_block(b))
    }

    const pages = rust.parse_dump(roam_raw_data)
    pages.forEach(p => {
        p.children?.map(b => ref_scan_block(b))
    })

    const map_child = (b: RoamBlock, level = 0): string => {
        let ref_id = ''
        if (block_refs.has(b.uid)) {
            ref_id = ` ^${b.uid}`
        }
        const own = `${' '.repeat(level * tabSize)}- ${b.string}${ref_id}\n`
        return own + (b.children?.map((c) => map_child(c, level + 1)).join('') ?? '')
    }

    return pages.map(p => {
        return new File({
                source,
                name: `${p.title}.md`,
                content: '# ' + p.title + '\n' + (p.children?.map((c) => map_child(c)).join('\n') ?? ''),
                date: Number(p.edit_time)
            }
        )
    })
}