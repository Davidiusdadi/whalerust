import loadRoamData from 'src/db/roam-loader'
import loadMdData from 'src/db/markdown-loader'

export class Source {
    name: string

    constructor(name: string) {
        this.name = name
    }

    getLoader() {
        if (this.name.toLowerCase().endsWith('.json')) {
            return (c: string) => {
                return loadRoamData(this, c)
            }
        } else if (this.name.toLowerCase().endsWith('.md')) {
            return (c: string) => loadMdData(this, this.name, c)
        } else {
            throw Error(`no loader for: ${this.name}`)
        }
    }

}