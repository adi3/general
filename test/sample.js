
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
