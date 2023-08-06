
/**
* @description This function fetches data from a Reddit API based on a specified subreddit.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that specifies the subreddit to fetch content from. It is 
* used to construct the URL for the Axios request to the Reddit API.
* 
* @returns { object } - The output returned by this function is a JSON object 
* containing the content of the specified subreddit. The function uses the `axios` 
* library to make a GET request to the Reddit API, and then logs the response to the 
* console before returning it.
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
* `x`, and three indices `start`, `end`, and returns `true` if the value `x` is found 
* in the array `arr` within the range specified by `start` and `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array that is being searched 
* for a specific element using the `search` function. The function takes four 
* parameters: `arr`, `x`, `start`, and `end`. `arr` is the array that is being 
* searched, and `x` is the element that is being looked for. `start` and `end` are 
* the boundaries of the search range, with `start` being the lower bound and `end` 
* being the upper bound.
* 
* @param { number } x - The `x` input parameter in the `search` function is the value 
* that should be found in the `arr` array.
* 
* @param { number } start - The `start` input parameter in the `search` function is 
* the index of the leftmost element of the array that could potentially be the target 
* element. It represents the starting point of the search.
* 
* @param { number } end - The `end` input parameter in the `search` function specifies 
* the end index of the range of elements to be searched. It is used to determine the 
* end point of the range of elements to be searched, and to prevent the function 
* from searching beyond the end of the array.
* 
* @returns { array } - Sure! I'd be happy to help you with that.
* 
* The function `search` takes four parameters: `arr`, `x`, `start`, and `end`.
* 
* Here's the output returned by the function:
* 
* If `arr` contains `x`, the function returns `true`.
* 
* For example, if `arr` is `[1, 2, 3, 4, 5]`, and `x` is `3`, the function returns 
* `true` because `3` is found in `arr`.
* 
* I hope that helps! Let me know if you have any other questions.
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
* @description This function is an AWS Lambda function that handles requests for the 
* FIDO2 authentication protocol.
* 
* @param { object } event - The `event` input parameter in the `handler` function 
* is an AWS Lambda event object that contains information about the incoming request.
* 
* In particular, the `event.requestContext.authorizer.jwt.claims` property contains 
* the JSON web token (JWT) claims that were provided in the request, which include 
* the user's identity information. The `event.pathParameters` property contains the 
* path parameters of the request, such as the "fido2path" parameter.
* 
* The `event` object is used throughout the function to retrieve these details and 
* use them to determine the appropriate response.
* 
* @returns { object } - The output returned by this function is a JSON object with 
* the following structure:
* 
* {
* "statusCode": 200,
* "body": JSON.stringify({
* "authenticators": [
* {
* "credentialId": "1234567890",
* "friendlyName": "My Authenticator"
* }
* ]
* }),
* "headers": {
* "Content-Type": "application/json"
* }
* }
* 
* where "authenticators" is an array of objects, each representing an authenticator 
* for the user, with the following properties:
* 
* - "credentialId": the unique ID of the authenticator
* - "friendlyName": the display name of the authenticator
* 
* The function returns this output for the following path parameters:
* 
* - "/fido2/register-authenticator/start"
* - "/fido2/register-authenticator/complete"
* - "/fido2/authenticators/list"
* - "/fido2/authenticators/delete"
* - "/fido2/authenticators/update"
* 
* For all other path parameters, the function returns a 404 error with the message 
* "Not found".
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
