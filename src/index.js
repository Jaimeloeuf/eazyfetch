import deepmerge from "deepmerge";
import isValidHttpMethod from "./isValidHttpMethod";

async function runErrorHandlers(error) {
  console.error("error out!!", error);
}

function createRequest(url = "", init, method, data) {
  init.method = method;
  init.body = data;

  // Call window fetch with prepended API URL and default request object

  // Can a plugin read values inside this Request object? Or can it directly modify this?
  return { ...init, url };
  // return new Request(url, init);
}

// give them a method, where they can just add stuff to the Req object without merging themselves as plugin authors

function f(req) {
  console.log("typeof req.body ", typeof req.body);
  if (typeof req.body === "object") req.body = JSON.stringify(req.body);

  return deepmerge(req, { url: "http://localhost:3000/ping" });
}

function f2(req) {
  console.log("in plugin2", req);
}

// Default plugin is window.fetch, append and pop to the end.
const plugins = [f, f2];
const afterPlugins = [console.log];

async function runPlugins(req) {
  try {
    // If plugin modify req, and the nxt is called, will it be the same object?
    // If a plugin have an error, they should just throw, so that we call the runErrorHandlers
    for (const plugin of plugins) req = (await plugin(req)) || req;

    const url = req.url;
    delete req.url;
    const request = new Request(url, req);

    console.log("bf call", request, request.body);

    const res = await window.fetch(request);

    console.log("res", await res.json());

    // for (const plugin of afterPlugins) await plugin(res);

    // Return the response result as default behaviour
    return res;
  } catch (error) {
    await runErrorHandlers(arguments[0]);
  }
}

// async because window.fetch returns a Promise, and we return it directly
async function _fetch(url = "", init, method, data) {
  const req = createRequest(url, init, method, data);

  await runPlugins(req);
}

// const defaultInit = {};
// how to set the obj values into defaultInit without modifying defaultInit
// Using spread operator? Delete all keys then spread the new one in.

// When modified, everywhere else that uses this lib will inherit this new default init
// Bad code can just set this to an invalid none object, which will fail when we set things on it
let defaultInit = {};

const createFetch = (init, method) => async (url, data) =>
  _fetch(url, init, method, data);

const fetchObject = {
  modifyDefaultInit(init = {}) {
    defaultInit = init;
  },

  modify(init = {}) {
    // Merge user provided init with default init, allowing user to override default options.
    // Uses deepmerge to ensure for nested overrides, only that key is being overwritten
    init = deepmerge(defaultInit, init);

    // Return this to allow chaining
    // Only Allowed to chain HTTP method calls to modify
    // The returned is also a empty object wrapped by a proxy
    return new Proxy(
      {},
      {
        get(target, prop) {
          console.log("Chained method called on modify: ", prop);

          // Verify method is supported
          if (isValidHttpMethod(prop)) return createFetch(init, prop);
          else
            throw new Error(
              `Can only chain HTTP methods to 'modify', invalid HTTP Method: ${prop}`
            );
        },
      }
    );
  },
};

const fetch = new Proxy(fetchObject, {
  get(target, prop) {
    console.log("Method called: ", prop);

    // Check if prop passed in is a HTTP method or if they are trying to access something on the target object
    if (isValidHttpMethod(prop)) return createFetch(defaultInit, prop);
    else return target[prop];
  },
});

export default fetch;
