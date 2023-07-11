
/**
* @description This function is a recursive function that takes in an array
* and a search value as parameters. It uses a divide and conquer
* approach to solve the problem of finding a specific value within an
* array. The function first checks if the search value is greater than
* the middle element of the array. If it is, the function calls
* itself recursively with the search value as the middle element and the
* start and end indices of the array.
* 
* @param { array } arr - The `arr` input parameter in this
* function is used to store the array that needs to be searched.
* It is used to pass the array to the `search` function and
* to access the elements of the array.
* 
* @param { string } x - The `x` input parameter is a
* value that is being searched for in the array. It is used
* to determine the range of values to search for in the array.
* 
* @param { number } start - The `start` input parameter in this
* function is used to specify the starting index of the array that
* needs to be searched. It is used to determine the range of
* indices to search for the given element `x`. The `start` value is
* used to calculate the mid-point of the array and the indices to
* search for the element.
* 
* @param { number } end - The `end` input parameter in this
* function is used to specify the index of the last element in
* the array to search for the target element.
* 
* @returns { array } - The output of this function is `true`.
* This is because the function returns `true` if the search is successful,
* and `false` if it is not.
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
