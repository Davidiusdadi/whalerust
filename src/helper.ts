import _ from 'lodash'

export function succinct_error_message(e: unknown) {
    if (e === undefined || e === null) {
        return e
    }
    if (_.isError(e)) {
        return e.message
    } else if (typeof e === 'object') {
        return e.toString()
    } else {
        return _.toString(e)
    }
}