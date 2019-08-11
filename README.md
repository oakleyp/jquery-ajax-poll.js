## jQuery ajaxPoll()

A utility function made to use jQuery's ajax() method to poll an API with the specified options until it returns a given response.

This example can easily be modified to repeatedly call any function that returns a promise-like result, rather than jQuery.

When the time comes around, I hope to update this to be a more generic utility.


### Example Usage:
```
ajaxPoll({
  ajax: () =>
    $.ajax('google.com/404')
  interval: 10000,
  maxAttempts: 5,
})
.until((jqXHR, textStatus, errorThrown) => 
  jqXHR.status !== 404
)
.timeout((...ajaxArgs) => {
  console.log('the maximum number of attempts were exceeded');
})
.finished((...ajaxArgs) => {
  doSomethingWithResult(...ajaxArgs);
});
```
