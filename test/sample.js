
/**
* @description This function, `_traceAnonymousFunctions`, is a method that extracts 
* information about anonymous functions within a given string of code. It scans the 
* code and creates an object with the names and starting positions of the anonymous 
* functions found.
*/
_traceAnonymousFunctions = () => {
    const regex = Settings[this.type].expressions;
    const matches = this.content.matchAll(regex);
    this.expressions = {};

    for (const match of matches) {
        const line = this._getLineNumber(match.index);
        this.expressions[line] = {
            name: match[1],
            start: match.index
        };
    }

    if (Object.keys(this.expressions).length === 0) {
        this.expressions = null;
    }
};


/**
* @description This function fetches data from a Reddit API based on a specified subreddit.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch()` 
* function is a string that specifies the subreddit to fetch posts from. It is used 
* to construct the URL for the Axios GET request.
* 
* @returns { object } - The output returned by this function is a JSON object 
* containing the data from the Reddit API for the specified subreddit. The function 
* uses the `axios` library to make a GET request to the API endpoint, and then logs 
* the response to the console before returning it.
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
* @description This function, named `search`, takes an array `arr`, a search value 
* `x`, and three indices `start`, `end`, and returns `true` if the value `x` exists 
* in the array `arr` within the range specified by `start` and `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array that is being searched 
* for a specific element using the `search` function. The function takes four 
* parameters: `arr`, `x`, `start`, and `end`. `arr` is the array to be searched, `x` 
* is the element to be found, `start` is the starting index of the search, and `end` 
* is the ending index of the search.
* 
* @param { any } x - The `x` input parameter in the `search` function is the element 
* to be searched in the array.
* 
* @param { number } start - The `start` input parameter in the `search` function is 
* used to specify the starting index of the range of elements in the `arr` array 
* that should be searched for the specified `x` value.
* 
* @param { number } end - The `end` input parameter in the `search` function represents 
* the end index of the range of elements to be searched. It specifies the last index 
* of the array that should be checked for the presence of the target element.
* 
* @returns { array } - The output returned by this function is `true` or `false`. 
* The function takes four parameters: an array `arr`, a search value `x`, a start 
* index `start`, and an end index `end`. It checks if the search value `x` exists 
* in the array `arr` within the specified range `start` to `end`. If it finds the 
* search value, it returns `true`; otherwise, it returns `false`.
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
* @description This is an AWS Lambda function that handles requests related to FIDO2 
* authenticators for a user. It determines the user handle, name, and display name 
* based on the JWT claims in the request context, and then checks if the RP ID in 
* the request is allowed.
* 
* 	 Registers a new authenticator: It calls `requestCredentialsChallenge` to get the 
* user to authenticate and store the credential.
* * Completes the new authenticator registration: It stores the credential response 
* and returns the stored credential.
* * Lists authenticators: It retrieves the existing credentials for the user and the 
* RP ID in the request.
* * Deletes an authenticator: It deletes the credential with the specified ID.
* * Updates an authenticator: It updates the credential with the specified ID and 
* friendly name.
* 
* The function returns a response with a status code and headers, and may include a 
* body with the result of the operation.
* 
* @param { object } event - In this function, `event` is the input parameter that 
* represents the incoming request to the Lambda function.
* 
* The `event` object is an instance of the `aws_event` type, which is a JSON object 
* that contains the following properties:
* 
* 	 `requestContext`: an object that contains information about the request, such 
* as the authorizer, the identity of the caller, and the request parameters.
* * `pathParameters`: an object that contains the path parameters of the request.
* * `queryStringParameters`: an object that contains the query string parameters of 
* the request.
* * `body`: the body of the request, which can be a JSON object or a string.
* 
* In this function, the `event` object is used to extract information about the 
* request and to determine the appropriate response. For example, the `event.pathParameters` 
* object is used to determine the path parameter values, and the `event.queryStringParameters` 
* object is used to determine the query string parameter values.
* 
* @returns { object } - Based on the code you provided, the output returned by the 
* function will be a JSON object with the following properties:
* 
* 	 `statusCode`: 200 (OK)
* * `body`: JSON.stringify({ authenticators: [] }})
* * `headers`: { 'Content-Type': 'application/json' }
* 
* This is because the function will only return a response if the `fido2path` parameter 
* is one of the following:
* 
* 	 `register-authenticator/start`
* * `register-authenticator/complete`
* * `authenticators/list`
* * `authenticators/delete`
* * `authenticators/update`
* 
* If the `fido2path` parameter is not one of these, the function will return a 404 
* status code with a message saying "Not found".
* 
* Please note that I have made some assumptions about the code you provided, such 
* as the `logger.info` and `logger.debug` statements being present and working as expected.
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
