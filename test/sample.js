
/**
* @description This function fetches data from a Reddit API based on a specified 
* subreddit, using Axios to make the HTTP GET request.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch()` 
* function is a string that specifies the subreddit to fetch posts from. The function 
* uses the `axios` library to make a GET request to the Reddit API, passing in the 
* subreddit name in the URL.
* 
* @returns { object } - The output returned by this function is a JSON object 
* containing the data from the specified subreddit. The function uses Axios to make 
* a GET request to the Reddit API, and then logs the response to the console before 
* returning it.
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
* @param { array } arr - The `arr` input parameter is an array of elements that is 
* being searched for a specific value using the `search` function. The function takes 
* four parameters: `arr`, `x`, `start`, and `end`. `arr` is the array to be searched, 
* `x` is the value to be found, `start` is the index of the first element to be 
* searched, and `end` is the index of the last element to be searched.
* 
* @param { number } x - The `x` input parameter in the `search` function is the value 
* to be searched in the array.
* 
* @param { number } start - The `start` input parameter in the `search` function is 
* used to specify the beginning index of the range of elements to be searched.
* 
* @param { number } end - The `end` input parameter in the `search` function represents 
* the index of the last element of the array that should be searched. It is used to 
* determine the end point of the search range. The function will search for the 
* element `x` in the array `arr` starting from the index `start` and ending at the 
* index `end`.
* 
* @returns { array } - The output returned by this function is `true` if the element 
* `x` is found in the array `arr`, and `false` otherwise.
* 
* Here's a breakdown of how the function works:
* 
* 1/ If `start` is greater than `end`, the function returns `false`.
* 2/ It calculates the midpoint of the range `start` to `end` using the formula 
* `Math.floor((start + end)/2)`.
* 3/ If the element at the midpoint is equal to `x`, the function returns `true`.
* 4/ If the element at the midpoint is greater than `x`, the function recursively 
* calls itself with `arr`, `x`, `start`, and `mid-1`.
* 5/ If the element at the midpoint is less than `x`, the function recursively calls 
* itself with `arr`, `x`, `mid+1`, and `end`.
* 6/ The function returns the result of the recursive call.
* 
* For example, if `arr = [1, 2, 3, 4, 5]`, `x = 3`, `start = 0`, and `end = 4`, the 
* function will return `true` because the element `3` is found in the array.
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



const handler = async(event) => {
/**
* @description This function is an AWS Lambda function that handles requests related 
* to FIDO2 authenticators for a user. It determines the user handle and name based 
* on the request context and path parameters, and then checks if the RP ID in the 
* request is allowed.
* 
* - Registers a new authenticator if the path parameter is "register-authenticator/start".
* - Completes the registration if the path parameter is "register-authenticator/complete".
* - Lists the user's authenticators if the path parameter is "authenticators/list".
* - Deletes an authenticator if the path parameter is "authenticators/delete".
* - Updates an authenticator if the path parameter is "authenticators/update".
* 
* The function returns a response object with a status code and body, and also logs 
* information in the AWS CloudWatch logger.
* 
* @param { object } event - The `event` input parameter is an object that contains 
* information about the incoming request.
* 
* In this function, the `event` object is used to extract information from the request 
* context, such as the user's sub, email, phone number, and other claims.
* 
* The `event` object is an instance of the `aws_lambda.APIGatewayProxyEvent` type, 
* and it contains the following properties:
* 
* - `requestContext`: an object that contains information about the request context, 
* such as the authorizer, the identity of the user, and the request ID.
* - `pathParameters`: an object that contains the path parameters of the request.
* - `queryStringParameters`: an object that contains the query string parameters of 
* the request.
* - `body`: the raw body of the request.
* 
* By using the `event` object, the `handler` function can access and process the 
* information provided in the request, and it can use this information to determine 
* the appropriate response to return to the client.
* 
* @returns { object } - The output returned by this function is a JavaScript object 
* with the following properties:
* 
* - `statusCode`: a string representing the HTTP status code (either "200", "400", 
* "404", or "500")
* - `body`: a string representing the body of the HTTP response
* - `headers`: an object containing the HTTP headers
* 
* The function takes an `event` object as input, which contains information about 
* the incoming HTTP request.
* 
* The possible values of `event.pathParameters.fido2path` are:
* 
* - "register-authenticator/start": starts a new authenticator registration flow
* - "register-authenticator/complete": completes the authenticator registration flow
* - "authenticators/list": lists the existing authenticators for a user
* - "authenticators/delete": deletes an authenticator
* - "authenticators/update": updates an authenticator
* 
* Based on the value of `event.pathParameters.fido2path`, the function returns a 
* response object with the appropriate status code, body, and headers.
*/
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
