export class File {
    name: string
    content: string
    date: number

    getLastModified() {
        return new Date(this.date).toLocaleDateString()
    }

    constructor(name: string, content: string, date = Date.now()) {
        this.name = name
        this.content = content
        this.date = date
    }
}