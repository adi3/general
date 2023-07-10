
/**
* @description This function makes an HTTP GET request to the Reddit API
* to fetch the latest posts in the specified subreddits. The response is
* then logged to the console and returned.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in this
* function is used to specify the sub-reddit that the function should search
* for. It can be any valid sub-reddit name or a specific one
* that you want to search for.
* 
* @returns {  } - The output returned by this function is
* the JSON data from the Reddit API. The data is returned in
* a Promise, and the catch block is used to handle any errors
* that may occur during the API call.
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
* @description This function is a helper function for the `_getLineNumber` function. It
* is used to get the line number of a matched expression and
* is called by the `_getLineNumber` function. The `this.expressions` object is updated with
* the line number and name of each matched expression.
*/
_traceAnonymousFunctions = () => {
        const regex = Settings[this.type].expressions;
        const matches = this.content.matchAll(regex);
        this.expressions = {};

        for (const match of matches) {
            const line = this._getLineNumber(match.index);
            this.expressions[line] = {
                name: match[1],
                start: match.index
            };
        }

        if (Object.keys(this.expressions).length === 0) {
            this.expressions = null;
        }
    };




/**
* @description This function is a recursive function that takes in an array
* and a value to search for. It uses a divide and conquer
* approach to find the index of the value in the array. The
* function first checks if the value is less than the middle of
* the array, and if so, it recursively calls itself with the left
* and right indices until the value is found.
* 
* @param { array } arr - The `arr` input parameter is a
* two-dimensional array that contains the elements to search for. It is used
* to pass the array to the `search` function and to store the
* search results.
* 
* @param { string } x - The `x` input parameter in this
* function is used to specify the value to be searched for. It
* is used to determine the range of values to search and the
* starting index of the search.
* 
* @param { array } start - The `start` input parameter in this
* function is used to determine the starting index of the search range.
* It is used to determine the range of indices to search for
* the given element `x`. The `start` parameter is passed as the starting
* index of the search range and is used to determine the range
* of indices to search for the given element `x`.
* 
* @param { number } end - The `end` input parameter in this
* function is used to determine the end index of the array to
* search. It is used to determine the range of indices to search
* in the `arr` array.
* 
* @returns { boolean } - The output returned by this function is
* the position of the element in the array that is closest to
* the given element. If the given element is not found in the
* array, the function returns false.
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
