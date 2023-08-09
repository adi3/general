

/**
* @description This function fetches data from a Reddit API based on a specified subreddit.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that specifies the subreddit to fetch data from. It is used 
* to construct the URL for the Axios request.
* 
* @returns { object } - The output returned by this function is a promise that 
* resolves to the response data from the Reddit API, specifically the JSON data from 
* the subreddit specified by the `sub` parameter. The function uses `axios` to make 
* a GET request to the Reddit API, and the response is logged to the console and 
* returned as the output.
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
* for a specific value using the binary search algorithm. The function takes four 
* parameters: `arr`, `x`, `start`, and `end`. `arr` is the array to be searched, `x` 
* is the value to be found, `start` is the beginning index of the search range, and 
* `end` is the end index of the search range.
* 
* @param { number } x - The `x` input parameter in the `search` function is the 
* element to be searched in the array.
* 
* @param { number } start - The `start` input parameter in the `search` function 
* represents the leftmost index of the range of elements to be searched.
* 
* @param { number } end - The `end` input parameter in the `search` function represents 
* the end index of the array being searched. It specifies the last index of the array 
* that should be checked for the target value.
* 
* @returns { array } - The output returned by this function is `true` if the element 
* `x` is found in the array `arr`, and `false` otherwise.
* 
* Here's a step-by-step explanation of how the function works:
* 
* 1/ If `start` is greater than `end`, the function returns `false`.
* 2/ It calculates the midpoint of the range `start` to `end` using the formula `mid 
* = Math.floor((start + end)/2)`.
* 3/ If the element `x` is found at the midpoint, the function returns `true`.
* 4/ If the element `x` is greater than the element at the midpoint, the function 
* recursively calls itself with `arr`, `x`, `start`, and `mid-1`.
* 5/ If the element `x` is less than the element at the midpoint, the function 
* recursively calls itself with `arr`, `x`, `mid+1`, and `end`.
* 
* The function continues this process until it finds the element `x` in the array 
* or reaches the end of the array.
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
* FIDO2 authentication API. It determines the user handle and name for the authenticator 
* registration or retrieval, and then calls appropriate functions to handle the request.
* 
* @param { object } event - The `event` input parameter is an object that contains 
* information about the incoming request.
* 
* In this function, `event` is an instance of the `APIGatewayProxyEvent` object, 
* which contains the following properties:
* 
* - `requestContext`: an object that contains information about the request, such 
* as the authorizer, the request ID, and the path.
* - `request': the actual request object, which contains the request headers, query 
* string parameters, and body.
* 
* The `event` object is used to extract information from the request and determine 
* the appropriate response. For example, the `requestContext.authorizer.jwt.claims` 
* property is used to retrieve the user's name, email, and other information from 
* the JWT token.
* 
* The `event` object is also used to log information about the request and response.
* 
* @returns { object } - Based on the code you provided, the output returned by the 
* function will be a JSON object with the following properties:
* 
* - `statusCode`: 200 (OK)
* - `body`: JSON.stringify({ options: ... })
* - `headers`: { ...
* 
* where `options` is an object containing the credentials challenge options, and 
* `headers` is an object containing the headers for the response.
* 
* Here's a breakdown of the function's logic:
* 
* 1/ It extracts the user handle, name, display name, and RP ID from the request 
* context and event parameters.
* 2/ It determines the user handle and name based on the provided information.
* 3/ It checks if the RP ID is recognized and allowed.
* 4/ If the RP ID is not recognized, it throws a UserFacingError.
* 5/ It calls the `requestCredentialsChallenge` function to get the credentials 
* challenge options.
* 6/ It logs the options and returns them as the response.
* 
* So, the output returned by the function will be a JSON object with the credentials 
* challenge options, headers, and a status code of 200 (OK).
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
