import axios from "axios";
import { toast } from "../components/Toast/Toast";
import Types from "../redux/_actions/_types";
import configureStore from "../redux/_store/configureStore";

export { _fetch as fetch };
let { store } = configureStore();

/**
* @description The function `logoutUser()` is used to logout the current user from
* the application. It removes the authorization token from the local storage and
* reloads the page to ensure that the user is logged out.
*/
function logoutUser() {
  localStorage.removeItem("authorizations");

  store.dispatch({
    type: Types.RESET_PERSIST_ON_LOGOUT,
  });
  window.location.reload();
}

/**
* @description The function `handleError` is used to handle errors that occur during
* the authentication process. It is triggered when an error occurs and the
* error message is "Token expired". The function logs the user out and
* displays a toast message to the user. The `setTimeout` function is used
* to wait for 1 second before logging the user out to prevent
* an infinite loop.
* 
* @param { object } error - The `error` input parameter is used
* to pass the error message to the `handleError` function. It is a
* string that contains the message or error that occurred. In this case,
* it is used to check if the error message is "Token expired"
* and if so, it calls the `logoutUser` function to logout the user.
* 
* @param { any } reject - The `reject` input parameter in this
* function is used to handle any errors that occur during the authentication
* process. When an error occurs, the function calls the `reject` method to
* pass the error to the parent component. In this case, the `reject`
* method is called to handle any errors that occur during the authentication
* process.
* 
* @returns { object } - The output returned by this function is
* "Something went wrong, Please login and try again.!!".
*/
function handleError(error, reject) {
  if (!error) {
    toast.error("Something went wrong, Please login and try again.!!");
  } else if (error) {
    const {
      data: { message },
    } = error;

    if (message === "Token expired") {
      setTimeout(() => {
        logoutUser();
      }, 1000);
    }
    toast.error(message);
  }
  reject(error);
  return;
}

/**
* @description This function is a placeholder for an asynchronous response that may
* not have been defined yet. It is used to handle the response
* from the server and can be used to perform any necessary actions
* or updates based on the response data.
* 
* @param successs - The `successs` input parameter in this function is a
* string that contains the response message returned by the server. It is
* used to determine whether the response was successful or not.
* 
* @param resolve - The `resolve` input parameter in this function is used
* to pass a value to the `resolve` callback function. The `resolve` callback
* function is used to indicate that the promise has been resolved with
* a value. In this case, it is used to indicate that the
* promise has been resolved with the `successs` array.
* 
* @returns {  } - The output of this function is undefined.
* This is because the function does not return anything, so there is
* no value to be output.
*/
function handleResponse(successs, resolve) {
  resolve(successs);
  return;
}

/**
* @description This function sets up a middleware for handling HTTP requests. It
* takes in a method, path, body, options, and params as arguments. The
* method is used to determine which HTTP method to use, and the
* path is used to determine which URL to send the request to.
* The body is the data that is sent with the request, and
* the options are any additional parameters that need to be sent with
* the request. The params parameter is used to add query parameters to
* the URL if needed.
* 
* @param { string } method - The `method` input parameter in this
* function is used to determine which HTTP method to use when making
* the request. For example, if the URL is `https://example.com/api/users`, the `method` parameter
* would be set to `get` to retrieve user data from the API.
* If the URL is `https://example.
* 
* @param { string } path - The `path` input parameter in this
* function is used to specify the URL path that the request should
* be made to. It is typically used to make API requests to
* a specific endpoint or resource, such as retrieving a list of books
* from a library or fetching user data from a database. The `path`
* parameter is passed as a string to the `axios` method, which uses
* it to construct the URL for the request.
* 
* @param { any } body - The `body` input parameter in this
* function is used to specify the HTTP method and body data to
* be sent to the API. It can be a string, an object,
* or an array depending on the HTTP method. In the example given,
* it is used to specify the HTTP method and body data for
* the `post` method.
* 
* @param { object } options - The `options` input parameter is used
* to pass additional options to the axios request. These options can be
* used to modify the request headers, set custom authentication credentials, or add
* additional query parameters to the request.
* 
* @param { object } params - The `params` input parameter in this
* function is used to add additional query parameters to the URL if
* needed. It can be used to specify additional headers or to add
* a query string to the URL. In the example provided, it is
* used to add a query string to the URL if the method
* is `get`.
* 
* @returns { object } - The output returned by this function depends
* on the HTTP method and the path of the request. If the
* HTTP method is "get", the response will be returned as a JSON
* object. If the HTTP method is "post", "put", or "delete", the response
* will be returned as a JSON object with the appropriate HTTP status
* code.
*/
function setMehod(method, path, body, options, params) {
  let config = {};
  if (options) config.headers = options;

  params = params ? "?" + new URLSearchParams(params).toString() : "";
  // if (method === "get" || method === "delete") {
  if (method === "get") {
    return axios[method](`${path}${params}`, config);
  } else if (method === "post" || method === "put") {
    return axios[method](`${path}`, body, config);
  } else if (method === "delete") {
    // return axios[method](`${path}`, config);

    return axios.delete(path, {
      headers: options,
      data: body,
    });
  }
}

/**
* @description This function is a promise that is used to fetch data
* from a server. It takes in the HTTP method, the URL to
* make the request to, the body of the request, and the options
* for the request. The request is then made to the server and
* the response is handled in the `then` block. If an error occurs,
* the error is handled in the `catch` block.
* 
* @param { string } method - The `method` input parameter in this
* function is used to specify the HTTP method to use when making
* the request.
* 
* 
* 
* @param { string } path - The `path` input parameter in this
* function is used to specify the HTTP method to use for the
* request.
* 
* 
* 
* @param body - The `body` input parameter in the `_fetch` function is
* an object that contains the data to be sent to the server.
* It can include any data that needs to be sent, such as
* form fields, query parameters, or other types of data. The `body` parameter
* is used to send data to the server and is typically used
* in HTTP requests.
* 
* @param { object } options - The `options` input parameter in this
* function is used to pass additional options to the underlying HTTP request.
* These options can include headers, cookies, and other parameters that are required
* by the specific HTTP method being used. In the case of the
* `_fetch` function, the `options` parameter is used to pass the HTTP method
* and any additional options required by the method.
* 
* @param { any } params - The `params` input parameter is used
* to pass additional parameters to the `_fetch` function. These parameters can be
* used to modify the request or response, or to add additional data
* to the request. In this case, it is being used to pass
* the `body` parameter to the `_fetch` function.
* 
* @returns {  } - The output returned by this function is
* an array of HTTP response objects, each containing a status code and
* a response body. The response body is a string that contains the
* response content.
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
