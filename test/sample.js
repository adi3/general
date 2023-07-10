
/**
* @description This function makes an HTTP GET request to the Reddit API
* to retrieve the latest posts in the specified subreddit. The response is
* then logged to the console and returned. If an error occurs during
* the request, the function returns null.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in this
* function is used to specify the sub-reddit to fetch data from. It
* can be any valid sub-reddit name or a custom one.
* 
* @returns { object } - The output returned by this function is
* a JSON object containing information about the subreddit specified in the `sub`
* parameter. The response contains the subreddit name, description, and link to the
* subreddit page.
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
