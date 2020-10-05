/**
 * Simple function to test if the given string is a supported HTTP method
 * @param {String} methodNameToTest
 */
export default (methodNameToTest) =>
  ["GET", "POST", "PUT", "DELETE", "OPTIONS"].includes(
    methodNameToTest.toUpperCase()
  );
