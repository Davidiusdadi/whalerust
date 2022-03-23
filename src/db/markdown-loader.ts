import { File } from 'src/db/file'
import type { Source } from 'src/db/file_source'

export default function loadMdData(source: Source, filename: string, filedata: string): File[] {
    return [new File({
        source,
        name: filename,
        content: filedata,
    })]
}