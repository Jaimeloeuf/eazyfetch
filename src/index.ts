import { merge } from "./utils/deepmerge";
import { runErrorHandlers } from "./runErrorHandlers";
import { isValidHttpMethod } from "./utils/isValidHttpMethod";
import { removePlugin } from "./utils/removePlugin";

async function runErrorHandlers(error: Error) {
  console.error("error out!!", error);
}

function createRequest(url = "", init: any, method: string, data?: object) {
  init.method = method;
  init.body = data;
  return { ...init, url };
}

// give them a method, where they can just add stuff to the Req object without merging themselves as plugin authors

function f(req: any): object {
  console.log("typeof req.body ", typeof req.body);
  if (typeof req.body === "object") req.body = JSON.stringify(req.body);

  return deepmerge(req, { url: "http://localhost:3000/ping" });
}

function f2(req: any): object | void {
  console.log("in plugin2", req);
}

// Default plugin is window.fetch, append and pop to the end.
const reqPlugins: Array<Function> = [f, f2];
const resPlugins: Array<Function> = [
  async (res: any): Promise<undefined> => (
    console.log("res", await res.json()), res
  ),
  // async (res: any): Promise<void> => console.log("res", await res.json()),
];

async function runPlugins(req: any) {
  try {
    // If plugin modify req, overwrite original req and continue calling subsequent plugin with new req.
    // If plugin errors out, they should throw and we will catch before calling runErrorHandlers with the error.
    for (const plugin of reqPlugins) req = (await plugin(req)) || req;

    const url = req.url;
    delete req.url;
    const request = new Request(url, req);

    console.log("bf call", request, request.body);

    let res = await window.fetch(request);

    for (const plugin of resPlugins) res = (await plugin(res)) || res;

    // Return the response result as default behaviour
    return res;
  } catch (error) {
    await runErrorHandlers(error);
  }
}

// async because window.fetch returns a Promise, and we return it directly
async function _fetch(url = "", init: any, method: string, data?: object) {
  // Create request object to be passed into reqPlugins and used later to generate the Request object for fetch call
  init.method = method;
  init.body = data;
  const req = { ...init, url };

  // Call without awaiting, for caller to await instead
  return runPlugins(req);
}

// const defaultInit = {};
// how to set the obj values into defaultInit without modifying defaultInit
// Using spread operator? Delete all keys then spread the new one in.

// When modified, everywhere else that uses this lib will inherit this new default init
// Bad code can just set this to an invalid none object, which will fail when we set things on it
let defaultInit = {};

const createFetch = (init: any, method: string) => async (
  url: string,
  data?: object
) => _fetch(url, init, method, data);

interface looseObjectType {
  [k: string]: any;
}

// Need this to even provide support for modify and modifyDefaultInit methods
// const fetchObject = {
const fetchObject: looseObjectType = {
  modifyDefaultInit(init = {}) {
    defaultInit = init;
  },

  modify(init = {}) {
    // Merge user provided init with default init, allowing user to override default options.
    // Uses deep merge to ensure for nested overrides, only that key is being overwritten
    init = merge(defaultInit, init);

    // Return this to allow chaining
    // Only Allowed to chain HTTP method calls to modify
    // The returned is also a empty object wrapped by a proxy
    return new Proxy(
      {},
      {
        // @todo Is this the right way to define that target is unused?
        get(_target, prop: string) {
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

  /* Func to get/set/remove plugins */

  getReqPlugin(): string[] {
    return reqPlugins.map((plugin) => plugin.name);
  },
  getResPlugin(): string[] {
    return resPlugins.map((plugin) => plugin.name);
  },

  addReqPlugin(plugin: Function): void {
    reqPlugins.push(plugin);
  },
  addResPlugin(plugin: Function): void {
    resPlugins.push(plugin);
  },

  // Methods to remove plugin using plugins' function name
  removeReqPlugin: removePlugin(resPlugins),
  removeResPlugin: removePlugin(resPlugins),
};

for (const method of ["GET", "POST", "PUT", "DELETE", "OPTIONS"])
  fetchObject[method] = () => {};

const fetch = new Proxy(fetchObject, {
  // get<T extends object, U extends string & keyof T>(target: T, prop: U)
  get(target: looseObjectType, prop: string) {
    console.log("Method called: ", prop);

    // Check if prop passed in is a HTTP method or if they are trying to access something on the target object
    if (isValidHttpMethod(prop)) return createFetch(defaultInit, prop);
    else return target[prop];
  },
});

export default fetch;
export { merge };
