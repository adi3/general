
/**
* @description This function fetches data from a Reddit API based on a specified 
* subreddit (default is "programming").
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that specifies the subreddit to fetch posts from. It is used 
* to construct the URL for the API request to retrieve posts from the specified subreddit.
* 
* @returns { object } - The output returned by this function is a JSON object 
* containing the data from the Reddit API for the specified subreddit. The function 
* uses the `axios` library to make a GET request to the Reddit API, and then logs 
* the response to the console and returns it.
*/
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
* @description The function `search` takes an array `arr`, a value `x`, and three 
* parameters `start`, `end`, and returns `true` if the value `x` is found in the 
* array `arr` within the specified range `start` to `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array of elements that the 
* function searches for the specified value `x`.
* 
* @param { number } x - The `x` input parameter in the `search` function is the value 
* that we are looking for in the array.
* 
* @param { number } start - The `start` input parameter specifies the starting index 
* of the array to be searched. It determines the beginning of the subarray that needs 
* to be searched for the target element `x`.
* 
* @param { number } end - The `end` input parameter in the `search` function determines 
* the end index of the array to be searched. It specifies the last index of the array 
* that should be checked for the presence of the value `x`.
* 
* @returns { array } - The output returned by this function is `true` if the value 
* `x` is found in the array `arr`, and `false` otherwise.
* 
* Here's a step-by-step explanation of how the function works:
* 
* 1. If `start` is greater than `end`, the function returns `false`.
* 2. It calculates the midpoint of the range `start` to `end` using the formula `mid 
* = Math.floor((start + end)/2)`.
* 3. If `arr[mid]` is equal to `x`, the function returns `true`.
* 4. If `arr[mid]` is greater than `x`, the function recursively calls itself with 
* `start` set to `mid-1` and `end` set to `end`.
* 5. If `arr[mid]` is less than `x`, the function recursively calls itself with 
* `start` set to `start` and `end` set to `mid+1`.
* 6. The function returns the result of the recursive call.
* 
* Note that the function assumes that the array `arr` is not modified during the 
* search process.
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
* to FIDO2 authenticators for a user. It determines the user's handle and name based 
* on the JWT claims in the request context, and then routes the request to the 
* appropriate endpoint based on the path parameter.
* 
* - `/register-authenticator/start`: starts the registration of a new authenticator 
* for the user
* - `/register-authenticator/complete`: completes the registration of a new authenticator 
* for the user
* - `/authenticators/list`: lists all authenticators for the user
* - `/authenticators/delete`: deletes an authenticator for the user
* - `/authenticators/update`: updates the friendly name of an authenticator for the 
* user
* 
* The function returns a response with a status code and body, depending on the 
* outcome of the request.
* 
* @param { object } event - The `event` input parameter is an object that contains 
* information about the incoming request.
* 
* Specifically, the `event` object contains the following properties:
* 
* - `requestContext`: an object that contains information about the request context, 
* such as the user's Amazon Cognito identity, the resource server, and the API caller.
* - `queryStringParameters`: an object that contains the query string parameters of 
* the request.
* - `body`: the request body, which is typically JSON-formatted data.
* 
* The `event` object is passed as an argument to the function, and it is used to 
* determine the current request path, query parameters, and body.
* 
* @returns { object } - Based on the code you provided, the output returned by the 
* `handler` function will be:
* 
* - If the `event.pathParameters.fido2path` is "register-authenticator/start", it 
* will return an object with the following properties:
* + `statusCode`: 200
* + `body`: JSON.stringify(options)
* + `headers`: {}
* - If the `event.pathParameters.fido2path` is "register-authenticator/complete", 
* it will return an object with the following properties:
* + `statusCode`: 200
* + `body`: JSON.stringify(storedCredential)
* + `headers`: {}
* - If the `event.pathParameters.fido2path` is "authenticators/list", it will return 
* an object with the following properties:
* + `statusCode`: 200
* + `body`: JSON.stringify({ authenticators: [] })
* + `headers`: {}
* - If the `event.pathParameters.fido2path` is "authenticators/delete", it will 
* return an object with the following properties:
* + `statusCode`: 204
* + `body`: JSON.stringify({ message: "Credential deleted successfully" })
* + `headers`: {}
* - If the `event.pathParameters.fido2path` is "authenticators/update", it will 
* return an object with the following properties:
* + `statusCode`: 200
* + `body`: JSON.stringify({ message: "Credential updated successfully" })
* + `headers`: {}
* - If the `event.pathParameters.fido2path` is not one of the above, it will return 
* an object with the following properties:
* + `statusCode`: 404
* + `body`: JSON.stringify({ message: "Not found" })
* + `headers`: {}
* 
* Please note that the output will be a JSON-formatted string, as you specified in 
* your question.
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
