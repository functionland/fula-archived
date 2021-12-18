import {graceful, main} from "./app";
import _debug from "debug";
const debug = _debug('server')

main().catch(async (t) => {
    debug('We Crashed!' + t.message)
    await graceful()
});
