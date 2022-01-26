async function callWithTimeout(fun, timeout) {
    let prom0 = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('timed out');
            reject('timeout');
        }, timeout);
    });
    let prom1 = new Promise((resolve, reject) => {
        try {
            let ret = fun();
            resolve(ret);
        } catch (err) {
            reject(err);
        }
    });
    console.log('calling race');
    return await Promise.race([prom0, prom1]);
}

async function task() {
    let prom = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('completed task');
            resolve(5);
        }, 2000);
    });
    return await prom;
}

try {
    let ret = await callWithTimeout(task, 1000);
    console.log('success', ret);
} catch (err) {
    console.log('failure', err);
}
