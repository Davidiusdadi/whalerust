import { RoamBlock } from '../../common/bindings/RoamBlock'
import * as rust from 'whale_rust_wasm'
import { File } from './file'




export default async function loadRoamData(roam_raw_data: string): Promise<File[]> {
    let map_child = (b: RoamBlock, level = 0): string => {
        const own = `${' '.repeat(level * 2)}- ${b.string}\n`
        return own + (b.children?.map((c) => map_child(c, level + 1)).join('\n') ?? '')
    }

    const pages = rust.parse_dump(roam_raw_data)
    return pages.filter(p => {
        // filter empty pages
        return (p.children ?? []).filter(c => c.string.trim().length > 0).length > 0
    }).map(p => {
        return new File(
            `${p.title}.md`,
            '# ' + p.title + '\n' + (p.children?.map(map_child).join('') ?? ''),
            Number(p.edit_time)
        )
    })
}