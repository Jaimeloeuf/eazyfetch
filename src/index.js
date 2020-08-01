/**
 * Module that simplifies and extends the browser fetch method with a easier API and plugin architecture
 * @author JJ
 */

// Throws an error and prevent module from being used if fetch is not available
if (!window.fetch) throw new Error("FETCH API NOT AVAILABLE ON BROWSER");

import deepmerge from "deepmerge";

import defaultErrorHandler from "./plugins/defaultErrorHandler";

/**
 * Suggestion: import package as "api" to avoid name collision with window.fetch
 */
export default class fetch {
  /**
   * @param {object} configurations configurations object to configure the library
   */
  constructor(configurations = {}) {
    // Destructure out all possible configuration values
    // All array values have default empty arrays to prevent accessing properties of undefined errors
    // @todo Remove to use null coalescing if using typescript or babel
    const {
      apiUrl,
      apiUrls = [],
      plugins = [],
      errorHandler,
      errorHandlers = [],
    } = configurations;

    /*
      Sequentially,
        set apiURLs
        then plugins
        then errorHandlers
    */

    // Combine all urls into a single array
    this._apiUrls = apiUrl ? [apiUrl, ...apiUrls] : apiUrls;

    // Set the module's internal base api URL
    // Defaults to empty string to prevent concatenation with undefined as undefined will get converted to a string
    // Order of precendence for the default base URL is apiUrl first then first apiUrl in the array of apiUrls
    // @todo Change this multi assignment
    this._apiUrl = this._default = this._apiUrls[0];


    // All base API URLs if any, gets attached directly onto the object with "$" prepended to the key
    // SOLVES THIS Might be dangerous as users can technically inject anything to pollute the "this" namespace
    if (this._apiUrls.length)
      deepmerge(
        this,
        apiUrls.reduce(function (acc, cur) {
          acc[`$${cur.name}`] = cur.url;
          return acc;
        }, {})
      );

    // Defaults to array even though the destructure already contains the default value just to be extra safe
    this._plugins = plugins || [];

    // These are either
    this._errorHandlers = errorHandler
      ? [errorHandler, ...errorHandlers]
      : errorHandlers
      ? errorHandlers
      : defaultErrorHandler;
  }

  /**
   * Should only be called by _fetch
   */
  async _runPlugins(url, init) {
    const request = {
      url,
      init,
      headers: init.headers,
      body: init.body,
    };

    const response = {
      body: response.body,
      status: response.code, // ???
    };

    const error = response.error;

    // Call the plugins
    for (const plugin in this._plugins) {
      // @todo How to set the return value of this as request or response?
      await plugin(request, response, { merge: deepmerge, error });
    }
  }

  async _runErrorHandlers(error) {
    // This might be slow if one handler takes a very long time
    for (const handler in this._errorHandlers) await handler(error);
  }

  /**
   * Inner fetch function used to prepend API base URL and parse the response
   * @function _fetch
   * @param {String} url path of the API only, the base API will be prepended
   * @param {object} init Request object required by fetch
   */
  async _fetch(url = "", init) {
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

  /**
   * GET curried function that takes a init object before an URL
   */
  _get(init = {}) {
    // Arrow function to inherit "this", without using explicit "this" binding
    return async (url) =>
      this._fetch(
        url,
        deepmerge(
          {
            method: "GET",
            headers: {
              Authorization: await getAuthHeader(this._firebaseAuth),
            },
          },
          init
        )
      );
  }

  /**
   * POST curried function that takes a init object before an URL and data
   */
  _post(init = {}) {
    // Arrow function to inherit "this", without using explicit "this" binding
    return async (url, data) => {
      if (data) init.body = JSON.stringify(data);

      return this._fetch(
        url,
        deepmerge(
          {
            method: "POST",
            headers: {
              "Content-Type": data ? "application/json" : undefined,
              Authorization: await getAuthHeader(this._firebaseAuth),
            },
          },
          init
        )
      );
    };
  }

  /**
   * PATCH curried function that takes a init object before an URL and data
   */
  _patch(init = {}) {
    // Arrow function to inherit "this", without using explicit "this" binding
    return async (url, data) => {
      if (data) init.body = JSON.stringify(data);

      return this._fetch(
        url,
        deepmerge(
          {
            method: "PATCH",
            headers: {
              "Content-Type": data ? "application/json" : undefined,
              Authorization: await getAuthHeader(this._firebaseAuth),
            },
          },
          init
        )
      );
    };
  }

  /**
   * PUT curried function that takes a init object before an URL and data
   */
  _put(init = {}) {
    // Arrow function to inherit "this", without using explicit "this" binding
    return async (url, data) => {
      if (data) init.body = JSON.stringify(data);

      return this._fetch(
        url,
        deepmerge(
          {
            method: "PUT",
            headers: {
              "Content-Type": data ? "application/json" : undefined,
              Authorization: await getAuthHeader(this._firebaseAuth),
            },
          },
          init
        )
      );
    };
  }

  /**
   * DELETE curried function that takes a init object before an URL and data
   * It is not recommended to include a request message body even though you are able to
   */
  _delete(init = {}) {
    // Arrow function to inherit "this", without using explicit "this" binding
    return async (url, data) => {
      if (data) init.body = JSON.stringify(data);

      return this._fetch(
        url,
        deepmerge(
          {
            method: "DELETE",
            headers: {
              "Content-Type": data ? "application/json" : undefined,
              Authorization: await getAuthHeader(this._firebaseAuth),
            },
          },
          init
        )
      );
    };
  }

  /**
   * Function to modify init object only once before making a new request
   * @param {object} init Request object for fetch
   * @returns {object} Same API object with custom request object partially applied.
   *
   * @example
   * api.modify(custom request object).post(url, data)
   */
  modify(init) {
    // Return the http methods to chain it and make a request
    return {
      get: this._get(init),
      post: this._post(init),
      patch: this._get(init),
      put: this._post(init),
      delete: this._post(init),
    };
  }

  /**
   * USE WITH CAUTION
   * Function to modify init objects permanently for ALL methods
   * @param {object} init Request object for fetch
   * @returns {object} Same object with updated methods with new custom request object partially applied.
   *
   * @example
   * api.modifyPermanently(custom request object).post(url, data)
   */
  modifyPermanently(init) {
    this.get = this._get(init);
    this.post = this._post(init);
    this.patch = this._get(init);
    this.put = this._post(init);
    this.delete = this._post(init);

    // Return object to allow caller to chain this method
    return this;
  }
}
