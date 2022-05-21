export const Store = (id) => {
    if (id) {
        set(id)
    }

    const set = (id) => {
        localStorage.setItem("serverId", id)
    }

    const get = () => {
        return localStorage.getItem("serverId")
    }

    return {
        set,
        get
    }
}
