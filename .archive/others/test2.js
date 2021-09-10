/* eslint-disable no-unused-vars */
import deepmerge from "deepmerge";
// import getParsedResponse from "./plugins/getParsedResponse";
// const deepmerge = require("deepmerge");
// const getParsedResponse = require("./plugins/getParsedResponse");

/**
 * Inner fetch function used to prepend API base URL and parse the response
 * @function _fetch
 * @param {String} url path of the API only, the base API will be prepended
 * @param {object} init Request object required by fetch
 */
async function _fetch(url = "", init) {
  try {
    // Set the return value to be init
    await this._runPlugins(url, init);

    // Call window fetch with prepended API URL and default request object
    const response = await window.fetch(this._apiUrl + url, init);

    const parsedResponse = await getParsedResponse(response);

    /* Return base on type of body data and include status code along side */
    if (parsedResponse.json)
      return { ...parsedResponse.response, statusCode: response.status };
    else if (parsedResponse.string)
      return { body: parsedResponse.response, statusCode: response.status };
    else throw new Error("Invalid body type. Neither JSON nor String");
  } catch (error) {
    return this._runErrorHandlers(error);
  }
}

class fetch {
  // Put default init here
  // #defaultInit = {};

  constructor() {
    //
    this.init;
  }

  modify(init = {}) {
    this.defaultInit = deepmerge(this.defaultInit, init);
    // Return this to allow chaining
    return this;
  }
}

const supportedHTTPmethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];

const _f = new Proxy(new fetch(), {
  get(target, prop) {
    console.log("getting0", target);
    console.log("getting0", target.modify());
    console.log("getting", target, prop);

    // Verify method is supported
    if (supportedHTTPmethods.includes(prop.toUpperCase())) return target;
  },
});
console.log(_f.test);

const tFetch = {
  modify: function (init) {
    // return tProxy;
    this.init = init;
    return this;
  },
};

function f(url, data, prop, init = {}) {
  // Hardcoded always same init data here
  const defaultInit = {
    //
  };

  // Merge init and defaultInit
  init = deepmerge(defaultInit, init);

  // Do we need to, .toUpper or something here?
  init.method = prop;
  init.data = data;

  return _fetch(url, init);
}

const tProxy = new Proxy(tFetch, {
  get(target, prop) {
    if (prop.toUpperCase() === "modify")
      // OH SHIT, this should return this proxy again right, somehow, to chain the init.... or...???
      return (init) => (url, data) => f(url, data, prop, init);

    return (url, data) => f(url, data, prop);
  },
});

// export default tProxy;

// return Reflect.get(...arguments);
