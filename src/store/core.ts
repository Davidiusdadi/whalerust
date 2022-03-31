import { File } from 'src/db/file'
import { Index } from 'src/db/indexer'
import { readable, get } from 'svelte/store'
import { Source } from 'src/db/file_source'
import { succinct_error_message } from 'src/helper'

const URL_LOCAL_STORAGE_KEY = 'roam_dump_json_url'

let update_files: (files: File[]) => void = () => undefined
let update_file: (files: File | null) => void = () => undefined

export const files = readable([] as File[], set => {
    update_files = set
})

export const file = readable(null as File | null, set => {
    update_file = set
})

export const index: Index = new Index()

export function setFiles(_files: File[]) {

    const new_files = _files.sort((a, b) => {
        return b.date - a.date // desc
    })
    new_files.forEach((f) => index.addFile(f))
    update_files(new_files)

// 4 debug purposes
    ;(window as any).files = files  // eslint-disable-line
    ;(window as any).index = index // eslint-disable-line
}


export async function onLoadUrl(url: string) {
    console.info(`opening url: ${url}`)
    try {
        const resp = await fetch(url)
        const roam_json_string = await resp.text()
        const source = new Source(url)
        const files_loaded = source.getLoader()(roam_json_string)
        localStorage.setItem(URL_LOCAL_STORAGE_KEY, url)
        setFiles(files_loaded)
    } catch (e) {
        update_files([])
        console.error(`opening failed: ${url}\n error: ${succinct_error_message(e)}`)
    }
}

export function manifestFile(source: Source, name: string) {
    const _files = get(files)
    let file = _files.find((f) => f.name_short === name)
    if (!file) { // lazy manifest page
        file = new File({
            source,
            name: `${name}.md`,
            content: `# ${name}\n\n\n\n`
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


const startup_url = localStorage.getItem(URL_LOCAL_STORAGE_KEY) ?? '/api/dump'

// startup sequence
void (async () => {
    const unsub = files.subscribe((files) => {
        if (files.length > 0) {
            unsub()
            let hash = decodeURIComponent(window.location.hash)
            if (hash) {
                hash = hash.slice(1) // remove the #
                update_file(manifestFile(files[0].source, hash))
            } else if (files.length > 0) {
                update_file(files[0])
            }
        }
    })

    try {
        await onLoadUrl(startup_url)
        console.info(`loaded: ${startup_url}`)
    } catch (e) {
        console.error(`failed to load ${startup_url}`, e)
        unsub()
    }
})()

