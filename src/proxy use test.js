import deepmerge from "deepmerge";

/**
 * Mock _fetch to mimic it for testing to see what is passed to it
 */
async function _fetch(url = "", init, data) {
  console.log("_fetch", url, init, data);
}

const defaultInit = {};

const validHttpMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const isValidHttpMethod = (methodNameToTest) =>
  validHttpMethods.includes(methodNameToTest.toUpperCase());

const createFetch = (init) => async (url, data) => _fetch(url, init, data);

const fetchetchObject = {
  modify(init = {}) {
    console.log("modify called", init);
    init = deepmerge(defaultInit, init);
    console.log("new init", init);

    return new Proxy(
      {},
      {
        get(target, prop) {
          console.log("internal getting", prop);

          // Verify method is supported
          if (isValidHttpMethod(prop))
            // default value for data for intellisense support
            return createFetch(init);
          else throw new Error("Invalid http method: ", prop);
        },
      }
    );
  },
};
const fetch = new Proxy(fetchetchObject, {
  get(target, prop) {
    console.log("getting", target, prop);

    // Verify method is supported
    if (isValidHttpMethod(prop)) return createFetch(defaultInit);
    else return target[prop];
  },
});

fetch.modify({ cool: "true" }).post("/test/url", { POSTDATA: "IMP" });
fetch.post("/test/url", { POSTDATA: "IMP" });
