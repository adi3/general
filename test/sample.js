
/**
* @description This function fetches data from a Reddit API based on a specified 
* subreddit, using Axios to make the HTTP request.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that specifies the subreddit to fetch posts from. It is used 
* to construct the URL for the Axios GET request.
* 
* @returns { object } - The output returned by this function is a JSON object 
* containing posts from the specified subreddit. The function uses Axios to make a 
* GET request to the Reddit API, and then logs the response to the console.
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
* in the array `arr` at any position between `start` and `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array that is being searched 
* for a specific value using the binary search algorithm. The function takes four 
* parameters: `arr`, `x`, `start`, and `end`.
* 
* @param { number } x - The `x` input parameter in the `search` function is the 
* element to be searched in the array.
* 
* @param { number } start - The `start` input parameter in the `search` function 
* represents the beginning index of the array to be searched. It determines the 
* starting point of the search, and the function will explore the middle section of 
* the array starting from this point.
* 
* @param { number } end - The `end` input parameter in the `search` function specifies 
* the end index of the range of elements to be searched. It determines the last 
* element that will be considered in the search. In other words, it defines the 
* boundary of the search space.
* 
* @returns { array } - The output returned by this function is `true` or `false`. 
* The function takes four parameters: `arr`, `x`, `start`, and `end`. It checks if 
* the element `x` is present in the array `arr` within the range specified by `start` 
* and `end`. If the element is found, the function returns `true`, otherwise it 
* returns `false`.
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
* @description This function is an AWS Lambda function that handles requests to an 
* API endpoint for managing authenticators. It determines the user handle and name 
* for the user making the request, and then checks the requested path parameter to 
* determine which endpoint to call.
* 
* - Starts a new authenticator registration if the path parameter is "register-authenticator/start".
* - Completes the authenticator registration if the path parameter is "register-authenticator/complete".
* - Lists the authenticators for the user if the path parameter is "authenticators/list".
* - Deletes an authenticator if the path parameter is "authenticators/delete".
* - Updates an authenticator if the path parameter is "authenticators/update".
* 
* If the requested path parameter is not recognized, the function returns a 404 error.
* 
* @param { object } event - The `event` input parameter in the `handler` function 
* is an object that contains information about the incoming request.
* 
* The `event` object includes properties such as `requestContext`, `pathParameters`, 
* `queryStringParameters`, `body`, and `headers`.
* 
* In the `handler` function, the `event` object is used to extract information about 
* the request, such as the RP ID, the user name, and the display name. The `event` 
* object is also used to validate the request and ensure that it is well-formed.
* 
* Overall, the `event` input parameter is a critical part of the `handler` function, 
* as it provides the necessary information about the incoming request to perform the 
* desired actions.
* 
* @returns { object } - Based on the code you provided, the output returned by this 
* function will be a JSON object with the following structure:
* 
* {
* "statusCode": 200,
* "body": JSON.stringify({
* "authenticators": [
* {
* "credentialId": "1234567890",
* "friendlyName": "My Authenticator",
* "type": "password"
* },
* {
* "credentialId": "9876543210",
* "friendlyName": "My Other Authenticator",
* "type": "password"
* }
* ]
* }),
* "headers": {
* "Content-Type": "application/json"
* }
* }
* 
* The "authenticators" field in the output contains an array of objects, each 
* representing a credential that is associated with the user.
* 
* - "credentialId": The unique identifier for the credential.
* - "friendlyName": A human-readable name for the credential.
* - "type": The type of credential (e.g.
* 
* The "statusCode" field in the output is set to 200, indicating that the request 
* was successful. The "body" field contains the JSON-formatted output, which includes 
* the list of credentials for the user.
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
