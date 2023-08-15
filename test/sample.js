
/**
* @description This function fetches data from a Reddit API based on a specified 
* subreddit. It uses Axios to make a GET request to the API endpoint and logs the 
* response to the console.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that specifies the subreddit to fetch content from. The 
* function uses the `axios` library to make a GET request to the Reddit API, passing 
* in the `sub` parameter as part of the URL.
* 
* @returns { object } - The output returned by this function is a JSON object 
* containing the data from the Reddit API. The function uses Axios to make a GET 
* request to the specified subreddit's JSON feed, and logs the response to the console 
* before returning it.
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
* `x`, and three indices `start`, `end`, and returns `true` if `x` is found in the 
* array `arr` within the range specified by `start` and `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array that is being searched 
* for a specific value using the binary search algorithm. The function takes four 
* parameters: `arr`, `x`, `start`, and `end`, where `arr` is the array to be searched, 
* `x` is the value to be found, `start` is the starting index of the search range, 
* and `end` is the ending index of the search range.
* 
* @param { number } x - The `x` input parameter in the `search` function is the 
* element to be searched within the array. It is used to determine whether the element 
* is present in the array or not.
* 
* @param { integer } start - The `start` input parameter in the `search` function 
* represents the leftmost index of the range of elements to be searched.
* 
* @param { number } end - The `end` input parameter in the `search` function represents 
* the end index of the array that should be searched. It determines the last index 
* of the array that the function will consider when searching for the specified value.
* 
* @returns { array } - The output returned by this function is `true` if the element 
* `x` is found in the array `arr`, and `false` otherwise.
* 
* Here's a step-by-step explanation of how the function works:
* 
* 1/ If `start` is greater than `end`, the function returns `false`.
* 2/ It calculates the midpoint of the range `start` to `end` using the formula 
* `(start + end) / 2`.
* 3/ If the element at the midpoint is equal to `x`, the function returns `true`.
* 4/ If the element at the midpoint is greater than `x`, the function recursively 
* calls itself with `arr`, `x`, `start`, and `mid-1` (excluding the midpoint).
* 5/ If the element at the midpoint is less than `x`, the function recursively calls 
* itself with `arr`, `x`, `mid+1`, and `end` (including the midpoint).
* 
* The function continues to recurse until it finds the element `x` in the array, or 
* until it reaches the end of the array.
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
* @returns { object } - Based on the code you provided, the output returned by this 
* function will be a JSON object with the following properties:
* 
* 	- `statusCode`: 200 (OK)
* 	- `body`: JSON.stringify({ options }))
* 	- `headers`: {
* 
* The `options` property will contain the credentials challenge response, which is 
* generated by the `requestCredentialsChallenge` function.
* 
* The `headers` property will contain the appropriate headers for the response.
* 
* Please note that the exact output will depend on the input parameters and the 
* implementation of the `requestCredentialsChallenge` and `getExistingCredentialsForUser` 
* functions.
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
