const user = {
  personalInfo: {
    name: "Michael Bluth",
    addresses: [{ city: "Sudden Valley" }],
  },
};

// const getNestedObject = (nestedObj, pathArr) => {
//   return pathArr.reduce(
//     (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : null),
//     nestedObj
//   );
// };

// pass in your object structure as array of strings
// const name = getNestedObject(user, ["personalInfo", "name"]);

// to access nested array, just pass in array index as an element the path array.
// const city = getNestedObject(user, ["personalInfo", "addresses", 0, "city"]);

// give them a method, where they can just add stuff to the Req object without merging themselves as plugin authors

// import deepmerge from "deepmerge";
// import deepmerge from "../utils/deepmerge";
import { merge as deepmerge } from "../utils/deepmerge";

interface reqObject {
  [k: string]: string | {};
}

const defaultReq: reqObject = {};

function merge(req: reqObject, objectPath: string, value: any): reqObject {
  const objectPathArray: Array<string> = objectPath.split(".");
  if (!objectPathArray.length) return req;

  //
  //   for (let i = 0, len = objectPathArray.length - 1; i < len; i++)
  //     req[objectPathArray[i]] = req[objectPathArray[i]] || {};

  //   req[objectPathArray.pop()!] = value;

  //   const lastPath = objectPathArray.pop();
  //   if (lastPath !== undefined) req[lastPath] = value;

  // req[objectPathArray[objectPathArray.length - 1]];

  return req;
}

// function getNestedObject(nestedObj, pathArr) {
//   return pathArr.reduce(
//     (obj: reqObject, key: string) =>
//       obj && obj[key] !== "undefined" ? obj[key] : null,
//     nestedObj
//   );
// }

// merge("req.headers.Authorization", "token");

export function insertHeaders(req: any): object | void {
  // Only return updated req object if there is a JSON body
  if (typeof req.body === "object") {
    req.body = JSON.stringify(req.body);
    return req;
  }

  req.headers;
}
