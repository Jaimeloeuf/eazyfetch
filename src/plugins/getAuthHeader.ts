/**
 * Only returns authentication header if user is authenticated.
 * Split out so if user is unauthenticated, this does not throw if currenUser is null
 * @function getAuthHeader
 * @param {function} [firebaseAuth] Firebase auth method
 * @returns {String} Authentication header or nothing.
 */
// export async function getAuthHeader(firebaseAuth: Function) {
//   if (firebaseAuth().currentUser)
//     return `Bearer ${await firebaseAuth().currentUser.getIdToken()}`;
// }
export function create(firebaseAuth: Function) {
  return async function getAuthHeader(req: any): Promise<any | void> {
    if (firebaseAuth().currentUser) {
      // Set empty object if it does not exists.
      // This should be done by the lib, give a empty header
      if (!req.headers) req.headers = {};

      req.headers.Authorization = `Bearer ${await firebaseAuth().currentUser.getIdToken()}`;

      return req;
    }
  };
}
