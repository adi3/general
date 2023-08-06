
/**
* @description This function fetches data from a Reddit API based on a specified subreddit. It uses Axios 
* to make a GET request to the Reddit API and logs the response to the console. If there is an error, 
* it logs the error and returns null.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` function is a string 
* that specifies the subreddit whose posts should be fetched. It is used to construct the URL for the 
* Axios GET request. For example, if `sub='programming'`, the URL would be `https://www.reddit.com/r/programming.json`.
* 
* @returns { object } - The output returned by this function is a promise that resolves to the response 
* object from the Axios GET request. The response object contains the data from the Reddit API for the 
* specified subreddit.
* 
* Here's a breakdown of the code:
* 
* 1. `const axios = require('axios')`: This line requires the Axios library and assigns it to the `axios` 
* variable.
* 2. `axios.get(`https://www.reddit.com/r/\${sub}.json`)`: This line makes a GET request to the Reddit 
* API, passing in the subreddit name as a parameter. The `\${sub}` syntax is used to insert the subreddit 
* name into the URL.
* 3. `.then((response) => { ... })`: This line specifies the callback function that will be called when 
* the request is successful. The callback function takes the response object as an argument and logs it 
* to the console.
* 4. `.catch((error) => { ... })`: This line specifies the callback function that will be called when 
* the request fails. The callback function takes the error object as an argument and logs it to the console.
* 
* So, the output returned by the function is the response object from the Axios GET request, which 
* contains the data from the Reddit API for the specified subreddit. If the request fails, the function 
* returns null.
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
* @description This function, named `search`, takes an array `arr`, a search value `x`, and three indices 
* `start`, `end`, and returns `true` if `x` is found in the array, and `false` otherwise. It uses a 
* binary search algorithm to find the index of `x` in the array.
* 
* @param { array } arr - The `arr` input parameter in this function is an array that is being searched 
* for a specific value. The function takes four parameters: `arr`, `x`, `start`, and `end`. `arr` is the 
* array that is being searched, `x` is the value that is being looked for, `start` is the index of the 
* first element in the array to be searched, and `end` is the index of the last element in the array to 
* be searched. The function returns `true` if the value `x` is found in the array `arr`, and `false` otherwise.
* 
* @param { any } x - The `x` input parameter in the `search` function is the element that we are looking 
* for in the array. It is used to determine whether a specific element is present in the array or not. 
* The function will return `true` if the element is found in the array, and `false` if it is not found.
* 
* @param { number } start - The `start` input parameter in the `search` function is used to specify the 
* starting index of the range of elements to be searched. It determines the beginning of the subarray 
* that needs to be searched.
* 
* In other words, `start` specifies the index of the first element to be searched, and the function will 
* then search the subarray starting from that element until it finds the target element or determines 
* that the target element is not present in the subarray.
* 
* For example, if `start` is set to 0, the function will search the entire array from the first element 
* to the last element. If `start` is set to 5, the function will search the subarray starting from the 
* 5th element to the last element.
* 
* @param { number } end - The `end` input parameter in the `search` function is the end index of the 
* range of elements in the array that should be searched. It specifies the position at which the search 
* should stop.
* 
* In other words, the `end` parameter determines the boundary beyond which the search should not proceed. 
* The function will return `false` if the search is not found within the range specified by `start` and 
* `end`.
* 
* For example, if `start` is 0 and `end` is 5, the function will search for the element `x` within the 
* range of elements at indices 0 to 5, and return `true` if the element is found within that range. If 
* the element is not found within that range, the function will return `false`.
* 
* @returns { array } - The output returned by this function is `false`.
* 
* Here's why:
* 
* The function takes four parameters: `arr`, `x`, `start`, and `end`. It then checks if `start` is greater 
* than `end`, and if so, it returns `false` immediately.
* 
* Next, it calculates the midpoint of `start` and `end` using `Math.floor((start + end)/2)`.
* 
* It then checks if `arr[mid]` is equal to `x`. Since this is not the case, the function continues to 
* the `if` statement that checks if `arr[mid]` is greater than `x`.
* 
* Since `arr[mid]` is greater than `x`, the function calls itself with `arr`, `x`, `start`, and `mid-1` 
* as arguments. This recursively calls the function with the updated parameters, and the process continues 
* until the function finds the first occurrence of `x` in the array or reaches the end of the array.
* 
* Since the function does not find `x` in the array, it returns `false` after recursively calling itself 
* multiple times. Therefore, the output returned by this function is `false`.
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
* @description This function is an AWS Lambda function that handles incoming requests to the FIDO2 API. 
* It determines the appropriate action to take based on the path parameter of the incoming request, and 
* performs that action.
* 
* - Starting a new authenticator registration
* - Completing the new authenticator registration
* - Listing authenticators
* - Deleting an authenticator
* - Updating an authenticator
* 
* The function takes into account the claims in the request context's JWT token to determine the user's 
* name, display name, and other information. It also checks the RP ID in the request to ensure it is 
* recognized and allowed. If an error occurs, the function returns an appropriate error response.
* 
* @param { object } event - The `event` input parameter in the `handler` function is an object that 
* contains information about the incoming request. It is passed as an argument to the function and is 
* used to retrieve information about the request and respond accordingly.
* 
* The `event` object contains the following properties:
* 
* - `requestContext`: an object that contains information about the request context, such as the user's 
* Amazon Cognito identity and any claims made in the request.
* - `pathParameters`: an object that contains the path parameters of the request.
* - `queryStringParameters`: an object that contains the query string parameters of the request.
* - `body`: the request body, which is typically used to pass data from the client to the server.
* 
* In the `handler` function, the `event` object is used to retrieve information about the request and 
* determine which endpoint the request is intended for. For example, the `pathParameters` object is used 
* to retrieve the path parameter `fido2path`, which is used to determine the type of endpoint the request 
* is intended for. The `queryStringParameters` object is also used to retrieve any query string parameters 
* that may be present in the request.
* 
* The `event` object is a key part of the AWS Lambda function context, and is passed as an argument to 
* all functions defined in the function code. It provides a way for the function to access and manipulate 
* the incoming request, and is a useful tool for handling requests and responding to user requests.
* 
* @returns { object } - Based on the provided function, the output returned by this function will be:
* 
* {
* "statusCode": 200,
* "body": JSON.
* 
* This is because the function is handling a GET request to the path `/fido2/authenticators/list`, and 
* it is returning a list of authenticators for the given user handle and RP ID. The list of authenticators 
* is encoded as JSON and returned in the response body with the `Content-Type` header set to `application/json`.
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
