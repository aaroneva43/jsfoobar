import { fromEvent, throttleTime, scan } from 'rxjs';

const manualThrottle = function (fn: Function, delay: number) {
    let lastCall = 0;
    return function (...args: any) {
        const now = Date.now();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
}


export default {
    manualThrottle
}