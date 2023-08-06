
/**
* @description This function fetches data from a Reddit API based on a specified subreddit.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that determines the subreddit to fetch content from. The 
* function uses the `axios` library to make a GET request to the specified subreddit's 
* JSON API endpoint. The endpoint is constructed by concatenating the base URL 
* `https://www.reddit.com/r/` with the value of `sub`.
* 
* @returns { object } - The output returned by this function is a promise that 
* resolves to the response object from the Axios API call.
* 
* Here's a breakdown of the code:
* 
* 1. `const axios = require('axios')`: This line requires the Axios library and 
* assigns it to the `axios` variable.
* 2. `axios.get(`https://www.reddit.com/r/\${sub}.json`): This line makes a GET 
* request to the Reddit API with the specified subreddit. The `\${sub}` syntax is a 
* template literal that inserts the `sub` variable into the URL.
* 3. `.then((response) => {...})`: This line handles the response from the API call. 
* The response is logged to the console and returned as the output of the function.
* 4. `.catch((error) => {...})`: This line handles any errors that may occur during 
* the API call.
* 
* So, the output of the function is a promise that resolves to the response object 
* from the Axios API call. If the API call is successful, the response object will 
* contain the data from the Reddit API.
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
* @description This function is a recursive binary search algorithm that searches 
* for a specific element 'x' in an array 'arr'. It returns 'true' if the element is 
* found, and 'false' otherwise. The function takes four parameters: 'arr', 'x', 
* 'start', and 'end'. It first checks if the start and end indexes are valid, and 
* then uses the 'mid' variable to calculate the midpoint of the range.
* 
* @param { array } arr - The `arr` input parameter in the `search` function is an 
* array of elements that needs to be searched for a specific element. The function 
* takes four parameters: `arr`, `x`, `start`, and `end`.
* 
* @param { any } x - The `x` input parameter in the `search` function is the value 
* that we are looking for in the array.
* 
* @param { number } start - The `start` input parameter in the `search` function 
* represents the beginning index of the array that we want to search.
* 
* In other words, `start` specifies the index of the first element in the array that 
* we want to check for the presence of the value `x`. If `start` is set to 0, the 
* function will search the entire array from the beginning.
* 
* @param { number } end - The `end` input parameter in the `search` function determines 
* the end index of the array to be searched.
* 
* In the function, the `end` parameter is used in the midpoint calculation, and it 
* also determines the end point of the search range.
* 
* For example, if `start` is 0 and `end` is 5, the function will search for the value 
* `x` in the first 5 elements of the array.
* 
* In summary, the `end` parameter helps to define the scope of the search and allows 
* the function to only search a specific portion of the array.
* 
* @returns { array } - The output returned by this function is `true` if the element 
* `x` is found in the array `arr`, and `false` otherwise.
* 
* Here's a step-by-step explanation of how the function works:
* 
* 1. If `start` is greater than `end`, the function returns `false` immediately.
* 2. It calculates the midpoint of the range `start` to `end` using the formula `mid 
* = Math.floor((start + end)/2)`.
* 3. If the element at index `mid` is equal to `x`, the function returns `true`.
* 4. If the element at index `mid` is greater than `x`, the function recursively 
* calls itself with `arr`, `x`, `start`, and `mid-1` as arguments.
* 5. If the element at index `mid` is less than `x`, the function recursively calls 
* itself with `arr`, `x`, `mid+1`, and `end` as arguments.
* 6. If the function finds `x` in the array, it returns `true`.
* 
* For example, if we call the function like this: `search([1, 2, 3, 4, 5], 3, 0, 
* 4)`, it will return `true` because the element 3 is found in the array.
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
* FIDO2-enabled AWS API Gateway. It takes in an event object and determines the 
* appropriate action to take based on the path parameters of the request.
* 
* 1. Register a new authenticator: The function starts the registration process for 
* a new authenticator, including validating the name and display name of the user.
* 2. Complete the authenticator registration: The function completes the registration 
* of a new authenticator, using the credentials provided in the request.
* 3. List authenticators: The function lists all the existing authenticators for a 
* user.
* 4. Delete an authenticator: The function deletes an existing authenticator for a 
* user.
* 5.
* 
* The function uses the `determineUserHandle` function to determine the user handle 
* for the user, and the `allowedRelyingPartyIds` array to check if the RP ID in the 
* request is recognized. It also uses the `requestCredentialsChallenge` function to 
* challenge the user for credentials, and the `handleCredentialsResponse` function 
* to store the response.
* 
* @param { object } event - The `event` input parameter in the `handler` function 
* is an object that contains information about the incoming request.
* 
* The `event` object contains properties such as `requestContext`, `queryStringParameters`, 
* `pathParameters`, and `body`, which provide details about the request, such as the 
* user's identity, the requested path and query string parameters, and the request 
* body.
* 
* In the `handler` function, the `event` object is used to retrieve the user's 
* identity and other information from the `requestContext.authorizer.jwt.claims` 
* property, and to access the request path and query string parameters using 
* `event.pathParameters` and `event.queryStringParameters`.
* 
* Overall, the `event` input parameter is an important part of the `handler` function 
* and is used to retrieve information about the incoming request and respond accordingly.
* 
* @returns { object } - Based on the code provided, the output returned by the 
* function will be:
* 
* {
* "statusCode": 404,
* "body": JSON.stringify({ message: "Not found" }),
* "headers": { }
* }
* 
* This is because the function is trying to access a path parameter that does not 
* exist, specifically "fido2path".
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
