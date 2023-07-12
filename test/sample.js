
/**
* @description This function fetches data from a specific subreddit on Reddit using
* the `axios` library. It takes a sub-reddit name as input and returns
* the JSON data from that subreddit. If there is an error, the
* function returns null.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in this
* function is used to specify the name of the subreddit to retrieve
* data from. It can be any valid name of a subreddit on
* Reddit.
* 
* @returns { object } - The output returned by this function is
* a JSON object containing the posts in the specified subreddit.
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
* @description This function is a recursive function that uses a divide and
* conquer approach to solve the problem of searching a sorted array. It
* takes three arguments: an array of elements to search, the starting index
* of the search, and the ending index of the search. It first
* checks if the array is empty, and if so, returns false. If
* the array is not empty, it checks if the middle element of
* the array is equal to the target element. If it is, it
* returns true.
* 
* @param { array } arr - The `arr` input parameter is a
* two-dimensional array that represents the array to be searched. It is used
* to pass the array to the `search` function and to access the
* elements of the array.
* 
* @param { string } x - The `x` input parameter is the
* value that the function is searching for. It is used to determine
* the range of elements to search for in the array.
* 
* @param { integer } start - The `start` input parameter is used
* to specify the starting index of the array to search for the
* given element. It is used to determine the range of elements to
* search for the given element. In this case, it is used to
* determine the starting index of the array to search for the given
* element.
* 
* @param { number } end - The `end` input parameter in this
* function is used to determine the end of the array to search.
* It is used to determine the range of indices to search for
* the target element `x`.
* 
* @returns { boolean } - The output of this function is `true`.
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
