import { File } from 'src/db/file'

export default function loadMdData(filename: string, filedata: string): File[] {
    return [new File(filename, filedata)]
}