
/**
* @description This function makes a request to Reddit's API to retrieve the
* latest posts in the specified sub-reddit. It then logs the response to
* the console and returns it.
* 
* @param { string } [sub='programming'] - The `sub` input parameter in this
* function is used to specify the name of the subreddit that the
* API will be fetching data from.
* 
* @returns { object } - The output of this function is the
* JSON data from the specified subreddit. The data is returned as a
* Promise that resolves to the response from the API.
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
* @description This function is used to extract the line number and the
* name of the expressions from the matched patterns in the content. It
* is used to create anonymous functions that can be used to generate
* the trace of the expressions.
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
* and a search value as parameters. It uses a divide and conquer
* approach to solve the problem. The function first checks if the search
* value is less than the middle element of the array. If it
* is, the function calls itself with the search value and the start
* and end indices of the array to search for the target value.
* 
* @param { array } arr - The `arr` input parameter is a
* two-dimensional array that represents the array being searched. It is used to
* store the elements of the array and to pass it to the
* `search` function.
* 
* @param { string } x - The `x` input parameter in this
* function is used to represent the value being searched for. It is
* passed as an argument to the function and is used to determine
* the range of values to search for.
* 
* @param { number } start - The `start` input parameter in this
* function is used to specify the index of the element being searched.
* It is used to determine the range of elements to search for
* the target element. In the function, it is used to determine the
* middle index of the array to be searched.
* 
* @param { number } end - The `end` input parameter in this
* function is used to determine the end of the array to search.
* It is used to determine the range of elements to search for
* the given number `x`. The `start` and `end` parameters are used to
* define the range of elements to search within the array.
* 
* @returns { boolean } - The output of this function is a
* boolean array indicating whether each element in the array is equal to
* the target element or not. The function returns true if all elements
* are equal to the target element, and false otherwise.
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
