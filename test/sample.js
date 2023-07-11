
/**
* @description This function makes a GET request to the Reddit API using
* the axios library, and returns the JSON data for the specified sub-reddit.
* 
* @param { string } [sub='programming'] - The `sub` input parameter is used
* to specify the sub-reddit that the function should search. It can be
* any valid sub-reddit name or a string that represents a sub-reddit category.
* The `sub` parameter is optional and can be left blank if you
* want to search for a generic sub-reddit.
* 
* @returns { object } - The output returned by this function is
* a JSON object containing all the posts in the specified subreddit.
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
