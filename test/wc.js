import axios from "axios";
import { toast } from "../components/Toast/Toast";
import Types from "../redux/_actions/_types";
import configureStore from "../redux/_store/configureStore";

export { _fetch as fetch };
let { store } = configureStore();

function logoutUser() {
  localStorage.removeItem("authorizations");

  store.dispatch({
    type: Types.RESET_PERSIST_ON_LOGOUT,
  });
  window.location.reload();
}

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

function handleResponse(successs, resolve) {
  resolve(successs);
  return;
}

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
