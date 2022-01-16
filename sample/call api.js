/* eslint-disable no-unused-vars */

// import plugin from "plugin";

/**
 * plugins are like middlewares, running one after the next
 * plugins will receive the request object before it gets sent, and they can choose to modify it, like inject some variables or what not.
 */
function plugin() {}

// We await all plugins, so yea, only use async if absolutely necessary.
// If nothing is returned, they will just take the original request that is passed in?
// merge is optional if user does not want it
// If i have a plugin like this, the user will install both packages and use them seperately?
async function fireAuthPlugin(request, response, merge) {
  request.headers = merge(request.headers, {
    authorization: `Bearer ${await firebaseAuth().currentUser.getIdToken()}`,
  });

  return request;
}

import fetch from "../src/index";

// If apiUrls is left undefined then nothing is added as the base URL
// We should add a feature to help user to normalize extra "/" in base URLs in case it fks with the api routes.

// Set onto the class?
fetch.config(configurations);

const api = new fetch({
  apiUrl: "...",
  apiUrls: [
    {
      // The first one is also the default URL
      name: "baseURLa",
      url: "...",
    },
    {
      name: "baseURLb",
      url: "...",
    },
  ],
  plugins: [() => {}, () => {}, () => {}],
  // When is this called? When the service returns a bad code or what?
  errorHandler: () => {},
  errorHandlers: [() => {}, () => {}, () => {}],
});

// Or instead of setting all of those with the constructor, we can use the setter methods
api.apiUrl({
  name: "new url",
  url: "test",
});
api.errorHandler(console.error);

api.get("/test/url");
api.modify("custom request object").get("/test/url");
api.post("/test/url", { data: "test" });
