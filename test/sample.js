
/**
* @description This function fetches data from a Reddit API based on a specified subreddit.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that specifies the subreddit to fetch content from. It is 
* used to construct the URL for the Axios GET request.
* 
* @returns { object } - The output returned by this function is a JSON object 
* containing posts from the specified subreddit. The function uses Axios to make a 
* GET request to the Reddit API, and the response is logged to the console and returned.
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
* `x`, and three indices `start`, `end`, and returns `true` if the search value is 
* found in the array, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array that is being searched 
* for a specific value using the binary search algorithm. The function takes four 
* parameters: `arr`, `x`, `start`, and `end`. `arr` is the array to be searched, `x` 
* is the value to be found, `start` is the index of the first element to be searched, 
* and `end` is the index of the last element to be searched.
* 
* @param { number } x - The `x` input parameter in the `search` function is the value 
* that is being searched for in the array. It is used to determine whether a specific 
* element is present in the array or not.
* 
* @param { number } start - The `start` input parameter in the `search` function 
* represents the index of the first element in the array to be searched. It determines 
* the starting point of the search, and the function will begin searching for the 
* specified value `x` starting from this point.
* 
* @param { number } end - The `end` input parameter in the `search` function determines 
* the end index of the range of elements to be searched. It is used to limit the 
* search to a specific portion of the array.
* 
* @returns { array } - The output returned by this function is `true` if the element 
* `x` is found in the array `arr`, and `false` otherwise.
* 
* Here's a breakdown of how the function works:
* 
* 1/ If the start and end indices are out of range (i.e., `start > end`), the function 
* returns `false`.
* 2/ If the midpoint of the range is equal to `x`, the function returns `true`.
* 3/ If the midpoint is greater than `x`, the function recursively calls itself with 
* the start and midpoint indices swapped.
* 4/ If the midpoint is less than `x`, the function recursively calls itself with 
* the midpoint and end indices swapped.
* 
* The function continues to recursively call itself until it finds the element `x` 
* in the array or determines that it is not present.
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
* @description This function is an AWS Lambda function that handles FIDO2 authenticator 
* registration and management requests. It determines the user handle, name, and 
* display name from the request context and uses the determined values to call other 
* functions to perform the requested action.
* 
* @param event - The `event` input parameter in the `handler` function is an object 
* that contains information about the incoming request.
* 
* In the `handler` function, the `event` object is used to access the request context, 
* including the authorizer claims and the request parameters. The 
* `event.requestContext.authorizer.jwt.claims` property is used to access the user's 
* name, email, phone number, and other information.
* 
* The `event` object is a key part of the AWS Lambda event model, and it provides a 
* way for the function to access and process the incoming request.
* 
* @returns { object } - Based on the provided code, the output returned by the 
* function will be a JSON object with the following properties:
* 
* 	- `statusCode`: 200 (OK)
* 	- `body`: JSON.stringify({ authenticators: [...], rpId: 'https://example.com' })
* 	- `headers`: {
* 'Content-Type': 'application/json',
* 'Access-Control-Allow-Origin': '*',
* 'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization'
* }
* 
* The `authenticators` property in the output will be an array of objects, where 
* each object represents an authenticator for the user.
* 
* Please note that the output may vary depending on the input parameters and the 
* implementation of the `handleCredentialsResponse` and `getExistingCredentialsForUser` 
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
