import {graceful, main} from "./app";
import debug from "debug";
debug.enabled('*')

main().catch(async (t) => {
    console.log(t)
    debug('We Crashed!' + t.message)
    console.log('we fucked')
    await graceful()
});
