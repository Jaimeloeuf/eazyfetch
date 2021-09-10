/**
 * Simple function to test if the given string is a supported HTTP method
 * @todo Allow lib users to modify the list of supported methods
 * @param {String} methodNameToTest
 */
export const isValidHttpMethod = (methodNameToTest) =>
  ["GET", "POST", "PUT", "DELETE", "OPTIONS"].includes(
    methodNameToTest.toUpperCase()
  );
