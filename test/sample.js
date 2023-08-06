
/**
* @description This function is an AWS Lambda function that handles incoming requests
* to the FIDO2 API. It takes in an event object and determines
* the appropriate response based on the path parameters of the request.
* 
* 1. Determines the user handle and name for the user making the
* request.
* 2. Checks if the RP ID in the request is recognized and
* allowed.
* 3. Handles requests to start a new authenticator registration.
* 4. Handles requests to
* complete an authenticator registration.
* 5. Handles requests to list existing authenticators for a
* user.
* 6. Handles requests to delete an authenticator.
* 7. Handles requests to update an
* authenticator's friendly name.
* 
* The function returns a response with a status code and a body
* containing the appropriate information. If an error occurs, the function returns a
* UserFacingError or an InternalServerError response.
* 
* @param { object } event - The `event` input parameter in the
* `handler` function is an object that contains information about the incoming request.
* It is an instance of the `aws_lambda.APIGatewayProxyEvent` type, which is a standard
* input parameter for AWS Lambda functions.
* 
* The `event` object contains various properties that provide information about the request,
* such as:
* 
* * `pathParameters`: An object that contains the request path parameters.
* * `queryStringParameters`: An
* object that contains the request query string parameters.
* * `requestContext`: An object that
* contains information about the request context, such as the authorizer, the identity
* of the caller, and the like.
* * `requestHeaders': An object that contains the
* request headers.
* * `requestBody': The request body as a binary stream.
* 
* In the `handler` function, the `event` object is used to access the
* request parameters and other information that is necessary to handle the request.
* For example, the `event.pathParameters.fido2path` property is used to determine the specific FIDO2
* endpoint that the request is targeting. The `event.queryStringParameters` property is used to
* retrieve any query string parameters that may have been passed in the
* request.
* 
* Overall, the `event` object is an important input parameter for the `handler`
* function, as it provides the necessary information to handle the incoming request.
* 
* @returns { object } - Based on the provided code, the output
* returned by the function will be a JSON object with the following
* properties:
* 
* * `statusCode`: 200 (OK)
* * `body`: JSON.
* 
* The function returns an empty JSON object with a `Content-Type` header set
* to `application/json`. The `statusCode` is set to 200 (OK) indicating that the
* request was successful.
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
