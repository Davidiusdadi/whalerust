export class File {
    private name: string
    content: string
    date: number


    get full_name() {
        return this.name
    }

    get name_short() {
        return this.name.replace(/\.[^.]+$/, '')
    }

    getLastModified() {
        return new Date(this.date).toLocaleDateString()
    }

    constructor(name: string, content: string, date = Date.now()) {
        this.name = name
        this.content = content
        this.date = date
    }
}