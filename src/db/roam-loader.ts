import type { RoamBlock } from '../../common/bindings/RoamBlock'

import * as rust from '../../whale_rust_wasm/pkg'
import { File } from 'src/db/file'
import type { Source } from 'src/db/file_source'
import { tabSize } from 'src/store/defaults'

export default function loadRoamData(source: Source, roam_raw_data: string): File[] {
    const map_child = (b: RoamBlock, level = 0): string => {
        const own = `${' '.repeat(level * tabSize)}- ${b.string}\n`
        return own + (b.children?.map((c) => map_child(c, level + 1)).join('\n') ?? '')
    }

    const pages = rust.parse_dump(roam_raw_data)
    return pages.filter(p => {
        // filter empty pages
        return (p.children ?? []).filter(c => c.string.trim().length > 0).length > 0
    }).map(p => {
        return new File({
                source,
                name: `${p.title}.md`,
                content: '# ' + p.title + '\n' + (p.children?.map(map_child).join('') ?? ''),
                date: Number(p.edit_time)
            }
        )
    })
}