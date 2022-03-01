//! Credit goes to https://stackoverflow.com/a/44123368/4554883

import type { Observable } from "rxjs/internal/Observable";


/** @private */
interface Deferred<Value = unknown> extends Promise<Value> {
    resolve(value?: Value): void;
    reject(error: Error): void;
}

/** @private */
/** @internal */
function defer<Value>(): Deferred<Value> {
    const transit = {} as Deferred<Value>;

    const promise = new Promise<Value>((resolve, reject) => {
        Object.assign(transit, { resolve, reject });
    });

    return Object.assign(promise, transit);
}

export async function * observableToAsyncGenerator<Value>(observable: Observable<Value>): AsyncIterableIterator<Value> {
    let deferred = defer<Value>();
    let finished = false;

    const subscription = observable.subscribe({
        next(value) {
            const result = deferred;
            deferred = defer<Value>();
            result.resolve(value);
        },

        error(error: unknown) {
            const result = deferred;
            deferred = defer<Value>();
            result.reject(error instanceof Error ? error : new Error(String(error)));
        },

        complete() {
            finished = true;
            deferred.resolve();
        },
    });

    try {
        while (true) {
            const value = await deferred;

            if (finished)
                break;

            yield value;
        }
    }

    finally {
        subscription.unsubscribe();
    }
}

export function concatArrayBuffers(bufs: any[]) {
    const result = new Uint8Array(bufs.reduce((totalSize, buf) => totalSize + buf.byteLength, 0));
    bufs.reduce((offset, buf) => {
        result.set(buf, offset)
        return offset + buf.byteLength
    }, 0)
    return result
}
