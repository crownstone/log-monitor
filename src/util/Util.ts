

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



}

const S4 = function () {
  return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
};

