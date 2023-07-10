
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


/**
* @description This function is a recursive function that takes in an array
* and a value to search for. It uses a divide and conquer
* approach to find the index of the element in the array. The
* function first checks if the array is empty, and if so, returns
* false. If it is not empty, it then checks if the middle
* element of the array is equal to the given value. If it
* is, the function returns true.
* 
* @param { array } arr - The `arr` input parameter is a
* two-dimensional array that represents the array being searched. It is used to
* pass the array to the `search` function and to access the elements
* of the array.
* 
* @param { string } x - The `x` input parameter is a
* number that represents the value being searched for in the array. It
* is used to determine the range of elements to search in the
* array and the index of the element to start at.
* 
* @param { number } start - The `start` input parameter in this
* function is used to specify the index of the element to search
* for. It is used to determine the range of elements to search
* for in the array. In this case, it is used to determine
* the range of elements to search for in the array.
* 
* @param { integer } end - The `end` input parameter in this
* function is used to specify the end index of the array to
* search. It is used to determine the range to search within the
* array. In the function, it is used to determine the start index
* of the search range.
* 
* @returns { array } - The output of the function is the
* position of the element in the array that is equal to the
* given element x. If the element is not found, the function returns
* false.
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
