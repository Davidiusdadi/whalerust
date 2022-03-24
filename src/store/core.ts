import { File } from 'src/db/file'
import { Index } from 'src/db/indexer'
import { boostrap_via_server_dump } from 'src/store/boostrap'
import { readable, get } from 'svelte/store'
import type { Source } from 'src/db/file_source'

const URL_LOCAL_STORAGE_KEY = 'roam_dump_json_url'

let update_files: (files: File[]) => void = () => undefined
let update_file: (files: File | null) => void = () => undefined

export const files = readable([] as File[], set => {
    update_files = set
})

export const file = readable(null as File | null, set => {
    update_file = set
})

export let index: Index = new Index()


export function setFiles(_files: File[]) {

    const is_files_init = get(files).length === 0

    const new_files = _files.sort((a, b) => {
        return b.date - a.date // desc
    })
    new_files.forEach((f) => index.addFile(f))
    update_files(new_files)

    if (is_files_init && _files.length > 0) {
        update_file(_files[0])
    }

// 4 debug purposes
    ;(window as any).files = files  // eslint-disable-line
    ;(window as any).index = index // eslint-disable-line
}


export function onLoadUrl(url: string) {
    console.info(`opening url: ${url}`)
    boostrap_via_server_dump(url)
        .then((loaded_files) => {
            localStorage.setItem(URL_LOCAL_STORAGE_KEY, url)
            setFiles(loaded_files)
        })
        .catch((e: Error) => {
            update_files([])
            console.error(`opening failed: ${url}\n error: ${e.toString()}`)
        })
}

export function manifestFile(source: Source, name: string) {
    const _files = get(files)
    let file = _files.find((f) => f.name_short === name)
    if (!file) { // lazy manifest page
        file = new File({
            source,
            name: `${name}.md`,
            content: `# ${name}`
        })
        _files.push(file)
        update_files(_files)
        index.addFile(file)
    }
    return file
}

export function onUserFileSelected(f: File) {
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


onLoadUrl(localStorage.getItem(URL_LOCAL_STORAGE_KEY) ?? '/api/dump')