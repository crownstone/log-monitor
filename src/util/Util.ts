

export const Util = {
  binSearch: function(time: number, data : [...any][] | any[], searchItem: number | string = 0, start = 0, end = null) : number {
    if (end === null) {
      end = data.length - 1;
    }
    let range = end - start;
    if (range == 0) {
      return null;
    }
    if (range == 1) {
      return Number(data[start][searchItem]) < time ? end : start;
    }

    let half = Math.floor(range/2) + start;
    let t = Number(data[half][searchItem]);
    let tNext = Number(data[half+1][searchItem]);

    if (t <= time && tNext > time) {
      return half;
    }
    if (t < time) {
      return Util.binSearch(time, data, searchItem, half, end);
    }
    if (t > time) {
      return Util.binSearch(time, data, searchItem, start, half);
    }
  },

  getUUID : () : string => {
    return (
      S4() + S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + S4() + S4()
    );
  },

  getShortUUID : () : string => {
    return (
      S4() + S4() + '-' +
      S4()
    );
  },


  postData: async function(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }

}

const S4 = function () {
  return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
};

