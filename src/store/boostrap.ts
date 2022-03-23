import loadRoamData from 'src/db/roam-loader'
import { Source } from 'src/db/file_source'


export const boostrap_via_server_dump = async (url: string) => {
    const resp = await fetch(url)
    const roam_json_string = await resp.text()
    return loadRoamData(new Source(url), roam_json_string)
}