import { Source } from 'src/db/file_source'
import { file, files, loadFromSource, systemActionViewPage } from 'src/store/core'
import { fetchUrl } from 'src/store/io'

interface SessionManagerStore {
    locations: string[]
}

const localStorage_keys = {
    store: 'store',
    raw_content: 'raw_content'
}


interface NavLocation {
    vault?: string
    page?: string
}

function getNavLocation(): NavLocation {
    let path = window.location.pathname
    if (path === '/') {
        path = window.location.hash
    }
    path = path.replace(/^[#]?/, '')
    const fragments = path.match(/\/vault\/(?<vault>[^/]+)(:?\/page\/(?<page>[^/]+))?/)
    const nav_loc = {} as NavLocation
    if (fragments) {
        nav_loc.vault = decodeURIComponent(fragments.groups!['vault'])
        nav_loc.page = fragments.groups!['page'] && decodeURIComponent(fragments.groups!['page'])
    }
    return nav_loc
}

let store: SessionManagerStore = {
    locations: []
}

const session_manager = {
    boot() {

        file.subscribe((file) => {
            if (file) {
                window.location.hash = `#/vault/${encodeURIComponent(file.source.full_url)}/page/${encodeURIComponent(file.name_short)}`
            }
        })

        const nav_loc = getNavLocation()
        const SessionManagerStore_raw = localStorage.getItem(localStorage_keys.store)
        if (!SessionManagerStore_raw) {
            store = {
                locations: []
            }
        } else {
            store = JSON.parse(SessionManagerStore_raw) as SessionManagerStore
        }

        console.log('booting:', nav_loc, store)

        let recall_progress = 0


        for (const url of store.locations) {
            recall_progress++
            this.recall(url)
        }


        if (files.length > 0) {
            const nav_loc = getNavLocation()
            if (nav_loc.vault && nav_loc.page) {
                const file = files.find(f => f.source.full_url === nav_loc.vault && f.name_short === nav_loc.page)
                if (file) {
                    systemActionViewPage(file)
                    return
                } else {
                    console.log('location not found.')
                }
            }

            if (recall_progress === store.locations.length) {
                if (files.length > 0) {
                    console.log('opening first page')
                    systemActionViewPage(files[0])
                }
            }
        }


    },
    recall(uri: string) {
        const log = (str: string) => console.log(`recalling: ${uri} (${str})`)
        const content = localStorage.getItem(`${localStorage_keys.raw_content}_${uri}`)
        const source = new Source(uri)
        if (!source.local) {
            log('fetching')
            void fetchUrl(source.full_url).catch(e => {
                if (content) {
                    log('falling back to cache')
                    loadFromSource(source.initRawContent(content))
                } else {
                    log('falling back to cache failed ')
                }
            })
        } else if (content) {
            log('getting local from cache')
            loadFromSource(source.initRawContent(content))
        } else {
            log('local not cached')
        }
    },
    save(source: Source) {
        if (!store.locations.includes(source.full_url)) {
            store.locations.push(source.full_url)
        }

        console.log(`saving to localStorage: ${source.full_url}`, store)
        localStorage.setItem(localStorage_keys.store, JSON.stringify(store))
        localStorage.setItem(`${localStorage_keys.raw_content}_${source.full_url}`, source.content_raw())
    }
}

export default session_manager