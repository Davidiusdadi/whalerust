import { RoamBlock } from '../../common/bindings/RoamBlock'

import * as rust from '../../whale_rust_wasm/pkg'
import { File } from 'src/db/file'

export default function loadRoamData(roam_raw_data: string): File[] {
    let map_child = (b: RoamBlock, level = 0) => {
        const own = `${' '.repeat(level * 2)}- ${b.string}\n`
        return own + (b.children?.map((c) => map_child(c, level + 1)).join('\n') ?? '')
    }

    const pages = rust.parse_dump(roam_raw_data)
    return pages.map(p => {
        return new File(
            `${p.title}.md`,
            '# ' + p.title + '\n' + (p.children?.map(map_child).join('') ?? ''),
            Number(p.edit_time)
        )
    })
}