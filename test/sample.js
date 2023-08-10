
/**
* @description This function fetches data from a Reddit API based on a specified 
* subreddit. It uses Axios to make a GET request to the API endpoint and logs the 
* response to the console.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch()` 
* function is a string that specifies the subreddit to fetch content from. The 
* function uses the `axios` library to make a GET request to the Reddit API, and the 
* URL for the request is constructed by combining the base URL for the Reddit API 
* (`https://www.reddit.com/r/`) with the value of the `sub` parameter.
* 
* @returns { object } - The output returned by this function is a promise of the 
* response data from the Reddit API, which is logged to the console and then returned.
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
* in the array `arr` within the specified range `start` to `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array that is being searched 
* for a specific value. The function takes four parameters: `arr`, `x`, `start`, and 
* `end`. The `arr` parameter is the array that is being searched, and the `x` parameter 
* is the value that is being searched for.
* 
* @param { number } x - The `x` input parameter in the `search` function is the value 
* to be searched within the array.
* 
* @param { number } start - The `start` input parameter is the leftmost index of the 
* range of elements in the array that should be searched for the specified value.
* 
* @param { number } end - The `end` input parameter in the `search` function specifies 
* the end index of the array to be searched. It determines the end point of the 
* search range, and the function will return false if the search element is not found 
* within this range.
* 
* @returns { array } - The output returned by this function is `true` or `false`, 
* depending on whether the element `x` is found in the array `arr` or not. The 
* function takes four parameters: `arr`, `x`, `start`, and `end`, and it uses a 
* binary search algorithm to search for the element `x` in the array `arr`.
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
* @description This function is an AWS Lambda function that handles requests to a 
* Fido2 authentication endpoint. It determines the user handle, name, and display 
* name based on the JWT claims in the request context.
* 
* @param { object } event - The `event` input parameter in this function is an object 
* that contains information about the incoming request.
* 
* Specifically, the `event` object contains the following properties:
* 
* 	- `requestContext`: an object that provides information about the request context, 
* including the authorizer claims and the request ID.
* 	- `pathParameters`: an object that contains the path parameters of the request.
* 	- `queryStringParameters`: an object that contains the query string parameters 
* of the request.
* 
* The `event` object is used extensively within the function to extract the necessary 
* information for handling the request. For example, the `event.requestContext.authorizer.jwt.claims` 
* property is used to extract the user's name, email, phone number, and other 
* information that is needed to complete the request.
* 
* @returns { object } - Based on the provided function, the output returned by the 
* function will be a JSON object with the following properties:
* 
* 	- statusCode: 200 (OK)
* 	- body: JSON.stringify({
*     authenticators: [
*         {
*             credentialId: 'credential-id',
*             friendlyName: 'authenticator-name',
*             type: 'authenticator-type',
*         },
*     ],
* })
* 	- headers: {
*     'Content-Type': 'application/json',
* }
* 
* This output is returned when the event path parameter fido2path is "authenticators/list".
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
