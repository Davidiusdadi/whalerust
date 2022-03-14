import loadRoamData from 'src/db/roam-loader'


export const boostrap_via_server_dump = async (url: string) => {
    const resp = await fetch(url)
    const roam_json_string = await resp.text()
    return loadRoamData(roam_json_string)
}