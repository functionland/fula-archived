import {app} from "./app";
import debug from "debug";
debug.enabled('*')

const main = async () => {
    const p = await app()
    const stop = async () => {
        await p.stop()
        process.exit(9)
    }
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
}

main()
