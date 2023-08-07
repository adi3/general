
/**
* @description This function fetches data from a Reddit API based on a specified subreddit.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in the `fetch` 
* function is a string that specifies the subreddit to fetch content from. The 
* function uses the `axios` library to make a GET request to the Reddit API, passing 
* in the `sub` parameter as part of the URL to specify the subreddit to retrieve 
* content from.
* 
* @returns {  } - The output returned by this function is a JSON object containing 
* the latest posts from the specified subreddit. The function uses the `axios` library 
* to make a GET request to the subreddit's JSON API endpoint, logs the response to 
* the console, and returns the response object.
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
* @description This function, named `search`, takes an array `arr`, a target value 
* `x`, and three indexes `start`, `end`, and returns `true` if `x` exists in the 
* array `arr` at any index between `start` and `end`, and `false` otherwise.
* 
* @param { array } arr - The `arr` input parameter is an array that is being searched 
* for a specific value. The function takes four parameters: `arr`, `x`, `start`, and 
* `end`. The `arr` parameter is the array that is being searched, and the `x` parameter 
* is the value that is being looked for. The `start` and `end` parameters define the 
* range of the array that is being searched.
* 
* @param { number } x - The `x` input parameter in the `search` function is the value 
* that we are looking for in the array.
* 
* @param { number } start - The `start` input parameter in the `search` function 
* represents the beginning index of the range of elements to be searched.
* 
* @param { number } end - The `end` input parameter in the `search` function specifies 
* the end index of the array to search. It is used to determine the end point of the 
* search range.
* 
* @returns { array } - The output returned by this function is `true` or `false`, 
* depending on whether the element `x` is found in the array `arr` or not. The 
* function takes four parameters: `arr`, `x`, `start`, and `end`, and it uses a 
* binary search algorithm to search for `x` in `arr`.
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
* FIDO2 authentication API. It takes in an event object and determines the appropriate 
* action to take based on the path parameters of the request. The function can handle 
* requests for registering new authenticators, completing the registration process, 
* listing existing authenticators, deleting existing authenticators, and updating 
* existing authenticators.
* 
* @param event - The `event` input parameter in the `handler` function is an object 
* that contains information about the incoming request.
* 
* In the `handler` function, the `event` object is used to extract information about 
* the request, such as the `sub`, `email`, `phone_number`, `name`, and `cognito:username` 
* claim values from the request context's `authorizer.jwt.claims` property.
* 
* The `event` object is a crucial input parameter in the `handler` function, as it 
* provides the necessary information to determine the appropriate response to the 
* incoming request.
* 
* @returns { object } - The output returned by this function is a JSON object with 
* the following properties:
* 
* 	 `statusCode`: 200 (OK)
* 	 `body`: JSON.stringify({
*     authenticators: [
*         {
*             credentialId: 'credential-id',
*             friendlyName: 'friendly-name',
*         },
*     ],
* })
* 	 `headers`: {
*     'Content-Type': 'application/json',
* }
* 
* The function returns this output when the `event.pathParameters.fido2path` is "authenticators/list".
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
