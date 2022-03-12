import {app} from "./app";

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
