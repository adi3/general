
/**
* @description This function makes an API request to Reddit's JSON API to
* retrieve the latest posts in the specified sub-reddit. The response is then
* logged to the console and returned.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in this
* function is used to specify the name of the subreddit that the
* function should fetch data from. The `programming` value is hardcoded in the
* function, but it can be changed to any other subreddit name.
* 
* @returns { object } - The output returned by this function is
* a JSON object containing all the posts from the specified subreddit.
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
