
/**
* @description This function fetches the JSON data from the Reddit API and
* logs it to the console. The `sub` parameter is used to specify
* the name of the subreddit to fetch data from.
* 
* @param { string } [sub='programming'] - The `sub` input parameter is used
* to specify the sub-reddit that the function should search for posts in.
* It can be any valid sub-reddit name, or a combination of sub-reddit
* names separated by spaces. The `sub` parameter is optional, but it is
* used to customize the function's behavior to search for posts in a
* specific sub-reddit.
* 
* @returns { object } - The output returned by this function is
* the JSON data from the Reddit API. The response is then logged
* to the console and the data is returned as a promise.
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
