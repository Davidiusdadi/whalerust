import { Source } from 'src/db/file_source'
import { succinct_error_message } from 'src/helper'
import { loadFromSource } from 'src/store/core'


export async function fetchUrl(url: string) {
    console.info(`opening url: ${url}`)
    try {
        const resp = await fetch(url)
        const roam_json_string = await resp.text()
        const source = new Source(url)
        const files_loaded = source.initRawContent(roam_json_string)
        loadFromSource(files_loaded)
    } catch (e) {
        console.error(`opening failed: ${url}\n error: ${succinct_error_message(e)}`)
    }
}

export function openLocalFile(e: Event) {
    const target = e.target as HTMLInputElement | null
    const selected_file = target?.files?.[0]

    if (!selected_file) {
        console.log('no file selected')
        return
    }

    const file_name = selected_file.name
    const source = new Source(`file://${file_name}`)

    console.log(`opening local file: ${source.name} (${source.full_url})`)

    const reader = new FileReader()
    reader.readAsText(selected_file)
    reader.onload = (e: ProgressEvent<FileReader>) => {
        const file_content = e.target!.result!.toString()
        loadFromSource(source.initRawContent(file_content))
    }
}