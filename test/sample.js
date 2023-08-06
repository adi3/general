/**
* @description This function is an AWS Lambda function that handles incoming requests to the FIDO2 API. 
* It takes in an event object and determines the appropriate action to take based on the path parameters 
* of the request.
* 
* 1. Determines the user handle and name for the user based on the JWT claims in the request context.
* 2. Checks if the RP ID in the request is recognized and allowed.
* 3. Based on the path parameter, performs the following actions:
* - If "register-authenticator/start", starts the new authenticator registration process.
* - If "register-authenticator/complete", completes the new authenticator registration process.
* - If "authenticators/list", lists the existing authenticators for the user.
* - If "authenticators/delete", deletes an authenticator for the user.
* - If "authenticators/update", updates an authenticator for the user.
* 4. Returns a response object with the appropriate status code, body, and headers.
* 
* @param { object } event - The `event` input parameter in the `handler` function is an object that 
* contains information about the incoming request. It is an instance of the `APIGatewayEvent` object, 
* which is the event object passed to the Lambda function by AWS API Gateway.
* 
* The `event` object contains various properties that provide information about the request, such as:
* 
* - `pathParameters`: an object that contains the parameters passed in the URL path.
* - `queryStringParameters`: an object that contains the parameters passed in the URL query string.
* - `requestContext`: an object that contains information about the request context, such as the authorizer, 
* the identity of the user, and the request ID.
* - `requestHeaders`: an object that contains the headers sent with the request.
* - `body`: the request body, which can be an JSON object or a binary data.
* 
* In the `handler` function, the `event` object is used to extract information about the request and to 
* determine the appropriate response. For example, the `event.pathParameters.fido2path` property is used 
* to determine the path parameter of the request, and the `event.queryStringParameters` property is used 
* to determine the query string parameters.
* 
* The `event` object is a key part of the AWS Lambda API, and it provides a way for the Lambda function 
* to access information about the incoming request and to respond accordingly.
* 
* @returns { object } - The output returned by this function is a JavaScript object with the following 
* properties:
* 
* - `statusCode`: a string representing the HTTP status code (either "200", "400", "404", or "500")
* - `body`: a string representing the body of the HTTP response (which may be empty)
* - `headers`: an object representing the HTTP headers of the response (which may be empty)
* 
* The specific values of these properties will depend on the input event and the implementation of the 
* function. However, the function will always return a JSON-formatted object with the specified properties.
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



/**
* @description This function fetches data from a specific subreddit on Reddit using
* the `axios` library. It takes a sub-reddit name as input and returns
* the JSON data from that subreddit. If there is an error, the
* function returns null.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in this
* function is used to specify the name of the subreddit to retrieve
* data from. It can be any valid name of a subreddit on
* Reddit.
* 
* @returns { object } - The output returned by this function is
* a JSON object containing the posts in the specified subreddit.
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
* @description This function is a recursive function that uses a divide and
* conquer approach to solve the problem of searching a sorted array. It
* takes three arguments: an array of elements to search, the starting index
* of the search, and the ending index of the search. It first
* checks if the array is empty, and if so, returns false. If
* the array is not empty, it checks if the middle element of
* the array is equal to the target element. If it is, it
* returns true.
* 
* @param { array } arr - The `arr` input parameter is a
* two-dimensional array that represents the array to be searched. It is used
* to pass the array to the `search` function and to access the
* elements of the array.
* 
* @param { string } x - The `x` input parameter is the
* value that the function is searching for. It is used to determine
* the range of elements to search for in the array.
* 
* @param { integer } start - The `start` input parameter is used
* to specify the starting index of the array to search for the
* given element. It is used to determine the range of elements to
* search for the given element. In this case, it is used to
* determine the starting index of the array to search for the given
* element.
* 
* @param { number } end - The `end` input parameter in this
* function is used to determine the end of the array to search.
* It is used to determine the range of indices to search for
* the target element `x`.
* 
* @returns { boolean } - The output of this function is `true`.
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
