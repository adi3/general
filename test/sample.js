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


/**
* @description This function is a recursive function that takes in an array
* and a value to search for, and returns true if the value
* is found in the array. The function uses a divide and conquer
* approach, where it first checks if the array is empty or if
* the value is found in the middle of the array. If it
* is found in the middle, the function returns true. If it is
* not found, the function recursively calls itself with the array divided in
* half.
* 
* @param { string } arr - The `arr` input parameter is a
* two-dimensional array that contains the elements to be searched. The first dimension
* represents the number of elements in the array, and the second dimension
* represents the index of each element in the array. The function uses
* the `arr` array to determine the range of elements to search for
* a particular value `x`.
* 
* @param { string } x - The `x` input parameter in this
* function is used to represent the value being searched for. It is
* used to determine the range of values to search and the direction
* of the search.
* 
* @param { integer } start - The `start` input parameter in the
* `search` function is used to specify the starting index of the array
* to search. It is used to determine the range of indices to
* search for the target element. In this case, it is used to
* determine the range of indices to search for the target element.
* 
* @param { integer } end - The `end` input parameter in this
* function is used to determine the end index of the array to
* search. It is used to determine the range of indices to search
* within the array.
* 
* @returns { array } - The output of this function is the
* index of the element that is equal to the given element. If
* the given element is not found in the array, the function will
* return false.
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
