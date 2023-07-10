
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


/**
* @description This function is a recursive function that takes three arguments: an
* array of elements, the value to search for, and the starting index
* of the search. It uses a divide and conquer strategy to find
* the first occurrence of the value in the array. The function first
* checks if the array is empty or if the value is present
* at the index of the starting index. If it is present, the
* function returns true.
* 
* @param { array } arr - The `arr` input parameter in this
* function is used to pass the array to be searched. It is
* used to specify the starting index of the search and the ending
* index of the search. The `arr` parameter is required and is passed
* as an argument to the function.
* 
* @param { string } x - The `x` input parameter is a
* value that is being searched for in the array. It is used
* to determine the range of elements to search and the position of
* the element to be found. The function will search for the element
* in the range specified by the `start` and `end` parameters, and return
* true if it is found.
* 
* @param { integer } start - The `start` input parameter in this
* function is used to specify the starting index of the array to
* search. It is used to determine the range of elements to search
* for in the array. The `start` value is then used to initialize
* the `mid` variable, which is used to determine the middle index of
* the array to search.
* 
* @param { number } end - The `end` input parameter in this
* function is used to specify the end index of the array to
* search. It is used to determine the range of the search and
* the index of the element to search for.
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
