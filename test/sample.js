
function fetch(sub = 'programming') {
    const axios = require('axios')

    axios.get(`https://www.reddit.com/r/\${sub}.json`)
    .then((response) => {
        console.log(response);
        return response;
    })
    .catch((error) => {
        console.error(error);
        return null;
    });
}





/**
* @description This function, named `search`, takes an array `arr`, a search value 
* `x`, and three indices `start`, `end`, and returns `true` if `x` is found in the 
* array `arr` within the range of indices `start` to `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array of elements that the 
* function searches for a specific element. The function takes the array and three 
* other parameters: `x`, `start`, and `end`.
* 
* @param { number } x - The `x` input parameter in the `search` function represents 
* the value that is being searched for in the array.
* 
* @param { number } start - The `start` input parameter in the `search` function 
* represents the starting index of the array to be searched. It determines the 
* beginning of the subarray that should be searched for the target value `x`.
* 
* @param { number } end - The `end` input parameter in the `search` function specifies 
* the end index of the array to be searched. It determines the end point of the range 
* of elements that need to be checked for the target value. The function will not 
* consider any elements beyond the end index in the search process.
* 
* @returns { array } - The output returned by this function is `true` or `false`. 
* The function takes four parameters: `arr`, `x`, `start`, and `end`. It searches 
* for the element `x` in the array `arr` starting from the index `start` and ending 
* at the index `end`.
*/
const search = (arr, x, start, end) => {
  if (start > end) return false;
  let mid = Math.floor((start + end)/2);

  if (arr[mid]===x) return true;
        
  if (arr[mid] > x) {
    return search(arr, x, start, mid-1);
  } else {
    return search(arr, x, mid+1, end);
  }
}




/**
* @description This function is an AWS Lambda function that handles requests related 
* to authenticators for a user. It determines the user handle and name based on the 
* JWT claims in the request context, and then checks if the requested path parameter 
* is a valid RP ID. If it is, the function calls the appropriate method to handle 
* the request, such as retrieving existing credentials for the user, deleting a 
* credential, or updating a credential.
* 
* @param { object } event - The `event` input parameter in the function is an object 
* that contains information about the incoming request.
* 
* Specifically, the `event` object contains the following properties:
* 
* 	- `requestContext`: An object that contains information about the request context, 
* such as the authorizer, user, and client.
* 	- `queryStringParameters`: An object that contains the query string parameters 
* of the request.
* 	- `body`: The request body, which is parsed as JSON.
* 
* The `event` object is used throughout the function to access these properties and 
* extract the necessary information to handle the request.
* 
* @returns { object } - Based on the provided code, the output returned by the 
* function will be a JSON object with the following properties:
* 
* 	- statusCode: 200 (if the request is valid and the operation is successful)
* 	- body: a JSON object representing the authenticator registration or list of authenticators
* 	- headers: a JSON object with additional information about the response, such as 
* caching and content type headers
* 
* Here's an example output for each of the possible path parameters:
* 
* 	- `/register-authenticator/start`:
* ```json
* {
*   "statusCode": 200,
*   "body": {
*     "name": "John Doe",
*     "displayName": "John Doe",
*     "rpId": "https://example.com",
*     "options": [
*       {
*         "credentialId": "123456789",
*         "friendlyName": "My Authenticator",
*         "displayName": "My Authenticator",
*         "type": "authenticator"
*       }
*     ]
*   },
*   "headers": {
*     "Content-Type": "application/json"
*   }
* }
* ```
* 	- `/register-authenticator/complete`:
* ```json
* {
*   "statusCode": 200,
*   "body": {
*     "credentialId": "123456789",
*     "friendlyName": "My Authenticator",
*     "displayName": "My Authenticator"
*   },
*   "headers": {
*     "Content-Type": "application/json"
*   }
* }
* ```
* 	- `/authenticators/list`:
* ```json
* {
*   "statusCode": 200,
*   "body": {
*     "authenticators": [
*       {
*         "credentialId": "123456789",
*         "friendlyName": "My Authenticator",
*         "displayName": "My Authenticator"
*       }
*     ]
*   },
*   "headers": {
*     "Content-Type": "application/json"
*   }
* }
* ```
* 	- `/authenticators/delete`:
* ```json
* {
*   "statusCode":
*/
const handler = async(event) => {
    try {
        const { sub, email, phone_number: phoneNumber, name, "cognito:username": cognitoUsername, } = event.requestContext.authorizer.jwt.claims;
        const userHandle = determineUserHandle({ sub, cognitoUsername });
        const userName = email ?? phoneNumber ?? name ?? cognitoUsername;
        const displayName = name ?? email;
        if (event.pathParameters.fido2path === "register-authenticator/start") {
            logger.info("Starting a new authenticator registration ...");
            if (!userName) {
                throw new Error("Unable to determine name for user");
            }
            if (!displayName) {
                throw new Error("Unable to determine display name for user");
            }
            const rpId = event.queryStringParameters?.rpId;
            if (!rpId) {
                throw new UserFacingError("Missing RP ID");
            }
            if (!allowedRelyingPartyIds.includes(rpId)) {
                throw new UserFacingError("Unrecognized RP ID");
            }
            const options = await requestCredentialsChallenge({
                userId: userHandle,
                name: userName,
                displayName,
                rpId,
            });
            logger.debug("Options:", JSON.stringify(options));
            return {
                statusCode: 200,
                body: JSON.stringify(options),
                headers,
            };
        }
        else if (event.pathParameters.fido2path === "register-authenticator/complete") {
            logger.info("Completing the new authenticator registration ...");
            const storedCredential = await handleCredentialsResponse(userHandle, parseBody(event));
            return {
                statusCode: 200,
                body: JSON.stringify(storedCredential),
                headers,
            };
        }
        else if (event.pathParameters.fido2path === "authenticators/list") {
            logger.info("Listing authenticators ...");
            const rpId = event.queryStringParameters?.rpId;
            if (!rpId) {
                throw new UserFacingError("Missing RP ID");
            }
            if (!allowedRelyingPartyIds.includes(rpId)) {
                throw new UserFacingError("Unrecognized RP ID");
            }
            const authenticators = await getExistingCredentialsForUser({
                userId: userHandle,
                rpId,
            });
            return {
                statusCode: 200,
                body: JSON.stringify({
                    authenticators,
                }),
                headers,
            };
        }
        else if (event.pathParameters.fido2path === "authenticators/delete") {
            logger.info("Deleting authenticator ...");
            const parsed = parseBody(event);
            assertBodyIsObject(parsed);
            logger.debug("CredentialId:", parsed.credentialId);
            await deleteCredential({
                userId: userHandle,
                credentialId: parsed.credentialId,
            });
            return { statusCode: 204 };
        }
        else if (event.pathParameters.fido2path === "authenticators/update") {
            const parsed = parseBody(event);
            assertBodyIsObject(parsed);
            await updateCredential({
                userId: userHandle,
                credentialId: parsed.credentialId,
                friendlyName: parsed.friendlyName,
            });
            return { statusCode: 200, headers };
        }
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Not found" }),
            headers,
        };
    }
    catch (err) {
        logger.error(err);
        if (err instanceof UserFacingError)
            return {
                statusCode: 400,
                body: JSON.stringify({ message: err.message }),
                headers,
            };
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
            headers,
        };
    }
}
