export function stringifyBody(req: any): object | void {
  // Only return updated req object if there is a JSON body
  if (typeof req.body === "object") {
    req.body = JSON.stringify(req.body);
    return req;
  }
}
