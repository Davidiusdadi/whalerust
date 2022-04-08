import { File } from 'src/db/file'
import { Index } from 'src/db/indexer'
import { readable, get, writable } from 'svelte/store'
import type { Source } from 'src/db/file_source'
import session_manager from 'src/store/session_manager'
import type { EditorViewMode } from 'src/lang/editor'

let update_file: (files: File | null) => void = () => undefined

export let files: File[] = []

export const file = readable<File | null>(null, set => {
    update_file = set
})

export const editor_view_mode = writable<EditorViewMode>('fancy')

export const index: Index = new Index()

export function loadFromSource(source: Source) {
    session_manager.save(source)
    const new_files = source.files.sort((a, b) => {
        return b.date - a.date // desc
    })
    new_files.forEach((f) => index.addFile(f))
    files = files.concat(...new_files)

    // 4 debug purposes
    ;(window as any).files = new_files  // eslint-disable-line
    ;(window as any).index = index // eslint-disable-line
}


export function manifestFile(source: Source, name: string) {
    let file = files.find((f) => f.name_short === name)
    if (!file) { // lazy manifest page
        file = new File({
            source,
            name: `${name}.md`,
            content: `# ${name}\n\n\n\n`
        })
        files.push(file)
        index.addFile(file)
    }
    return file
}

export function systemActionViewPage(f: File) {
    update_file(f)
}

export function userActionViewPage(f: File) {
    update_file(f)
}

export interface FileSuggestion {
    file: File,
}

export function suggest(query: string): FileSuggestion[] {
    const max_res = 20
    const regex = new RegExp(`${query}`, 'i')
    const results: FileSuggestion[] = []
    for (const file of index.pages) {
        if (file.name_short.match(regex)) {
            results.push({
                file
            })
            if (results.length >= max_res) {
                break
            }
        }
    }
    return results
}


void session_manager.boot()