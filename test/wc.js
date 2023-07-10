/**
* @description This function is a promise that is used to fetch data
* from a server. It takes in the HTTP method, the URL to
* fetch data from, the body of the request, and the options for
* the request. It then sets up a new promise that will resolve
* when the data is received from the server. The promise is then
* passed to the setMehod function, which is responsible for making the HTTP
* request.
* 
* @param { string } method - The `method` input parameter in this
* function is used to specify the HTTP method to use when making
* the request. It can be one of the common HTTP methods such
* as `GET`, `POST`, `PUT`, etc.
* 
* @param { string } path - The `path` input parameter in this
* function is used to specify the HTTP method to use for the
* request.
* 
* 
* 
* @param { object } body - The `body` input parameter is used
* to specify the HTTP method and the data payload that should be
* sent to the server. In the case of the `_fetch` function, it
* is used to specify the HTTP method and the data payload that
* should be sent to the server.
* 
* @param { object } options - The `options` input parameter in this
* function is used to pass additional options to the request. These options
* can be used to modify the request headers, set timeouts, and add
* additional headers to the request.
* 
* @param { any } params - The `params` input parameter is used
* to pass additional data to the server. In this case, it is
* used to pass a custom authentication token to the server. The authentication
* token is sent as a query string parameter in the URL and
* is used to authenticate the user and retrieve their data.
* 
* @returns {  } - The output returned by this function depends
* on the specific implementation of the _fetch method and the response from
* the server. In general, it will be an HTTP response object, which
* can contain information such as the response status code, content type, and
* headers.
*/
function _fetch(method, path, body, options, params) {
  return new Promise((resolve, reject) => {
    return setMehod(method, path, body, options, params)
      .then(function (response) {
        handleResponse(response, resolve);
        return;
      })
      .catch(function (error) {
        // return handleError(error);
        handleError(error.response, reject);
        return;
      });
  });
}