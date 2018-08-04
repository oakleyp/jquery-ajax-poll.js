(function( $ ) {
  $.fn.ajaxPoll = function({ajax_inst, attempt, max_attempts, interval, until, timeout, finished}) {
    attempt = (attempt && ++attempt) || 1;
    max_attempts = max_attempts || 60;
    interval = interval || 8000;

    if (typeof until === 'function' && typeof finished === 'function') {
        const _ajax_callback = (...ajax_args) => { 
            if (!until(...ajax_args) && attempt <= max_attempts) {
                return setTimeout(() => $.fn.ajaxPoll({ajax_inst, attempt, max_attempts, interval, until, timeout, finished}), interval);
            } else if (attempt > max_attempts && typeof timeout === 'function') {
                return timeout(...ajax_args); 
            } else {
                return finished(...ajax_args);
            }
        };

        ajax_inst.always(_ajax_callback);
    } else {
        attempt = 1;
    }

    return Object.assign(ajax_inst, {
        until(fn) {
          const until_chain_callback = (typeof until === 'function') ? // If there's already an until function, create a new until function that combines it and the next caller's
              (...ajax_args) => { return until(...ajax_args) && fn(...ajax_args) } :
              fn;
          return $.fn.ajaxPoll({ajax_inst, attempt, max_attempts, interval, until: until_chain_callback, timeout, finished});
        },
        timeout: (fn) => $.fn.ajaxPoll({ajax_inst, attempt, max_attempts, interval, until, timeout: fn, finished}),
        finished: (fn) => $.fn.ajaxPoll({ajax_inst, attempt, max_attempts, interval, until, timeout, finished: fn})
    });
  }; 
})( jQuery );