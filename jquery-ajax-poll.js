/**
 * @function ajaxPoll
 * 
 * A function that takes the given ajax() function and calls until() with the result until
 * either the until() function returns a value interpreted as true, where finished() is called with the latest
 * result; or the attempt exceeds the maximum number of attempts given, in which case timeout() is called 
 * with the latest result
 * 
 * @param {object} args
 * @param {function} args.ajax - a function that returns the result of calling $.ajax() 
 * @param {number} args.attempt - the current attempt, defaults to 0
 * @param {integer} args.maxAttempts - the maximum number of times to call the given ajax function 
 * @param {number} args.interval - the interval in ms to call the passed ajax function
 * @param {function} args.until - a function that, given the result of calling the passed ajax function, returns true when polling is finished
 * @param {function} args.timeout - a function that is called when the current attempt exceed the maximum number of attempts
 * @param {function} args.finished - a function that is called when the passed until callback is true; ie. the polling is complete
 * 
 * @returns {object} - an object with the following functions, where each accepts a callback that is called with the result of the latest ajax() call
 * @returns {function} until - chainable function that accepts a callback where, true is returned, polling is finished, and the finished() function is called
 * @returns {function} timeout - function that accepts a callback that is called if attempt exceeds the number of maxAttempts specified
 * @returns {function} finished - function that accepts a callback that is called when the given until() function returns a "true" value
 */
function ajaxPoll({ajax, attempt, maxAttempts = 60, interval = 8000, until, timeout, finished}) {
    attempt = (attempt && ++attempt) || 1;

    if (typeof until === 'function' && typeof finished === 'function') {
        const _ajaxCallback = (...ajaxArgs) => { 
            if (!until(...ajaxArgs) && attempt < maxAttempts) {
                return setTimeout(() => ajaxPoll({ajax, attempt, maxAttempts, interval, until, timeout, finished}), interval);
            } else if (attempt >= maxAttempts && typeof timeout === 'function') {
                return timeout(...ajaxArgs);
            } else {
                return finished(...ajaxArgs);
            }
        };

        ajax().always(_ajaxCallback);
    }

    return {
        until(fn) {
            const unitlChainCallback = (typeof until === 'function') ? // If there's already an until function, create a new until function that combines it and the next caller's
                (...ajaxArgs) => { return until(...ajaxArgs) && fn(...ajaxArgs) } :
                fn;
            return ajaxPoll({ajax, attempt, maxAttempts, interval, until: unitlChainCallback, timeout, finished});
        },
        timeout: (fn) => ajaxPoll({ajax, attempt, maxAttempts, interval, until, timeout: fn, finished}),
        finished: (fn) => ajaxPoll({ajax, attempt: 0, maxAttempts, interval, until, timeout, finished: fn})
    };
}