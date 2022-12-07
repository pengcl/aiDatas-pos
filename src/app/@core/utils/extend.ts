import {hex_md5} from './md5';

export declare interface PageDto {
  currentPage: number;
  pageSize: number;
  startIndex?: number;
  totalPage?: number;
  totalSize?: number;
}

export const groupPlans = (plans, type) => {
  const groupKeys = {
    film: 'id',
    hall: 'uidHall',
    time: ''
  };
  const map = {};
  let items = [];
  const groupKey = groupKeys[type];
  if (groupKey) {
    plans.forEach((film) => {
      // 判断items中是否有相同groupKey影片
      if (!map[film[groupKey]]) {
        const plan = {
          groupKey,
          id: film.id,
          uidHall: film.uidHall,
          hallName: film.hallName,
          fieldOrder: film.fieldOrder,
          posTotalSeatNum: film.posTotalSeatNum,
          posMovieName: film.posMovieName,
          posMovieNameShort: film.posMovieNameShort,
          posMovieLan: film.posMovieLan,
          planMovieDuration: film.planMovieDuration,
          planMoviePublish: film.planMoviePublish,
          planTimeInterval: film.planTimeInterval,
          timeIntervalSeq: film.timeIntervalSeq,
          plans: [film]
        };
        items.push(plan);
        map[film[groupKey]] = true;
      } else {
        items.forEach(item => {
          if (item[groupKey] === film[groupKey]) {
            item.plans.push(film);
          }
        });
      }
    });
  }
  items = items.filter(item => {
    return item.plans.length > 0;
  });
  if (type === 'film') {
    items.sort((a, b) => {
      return b.plans.length - a.plans.length;
    });
    /*items.sort((a, b) => {
      return b.posMovieName.localeCompare(a.posMovieName, 'zh');
    });*/
  }
  if (type === 'hall') {
    items.sort((a, b) => {
      return a.fieldOrder === b.fieldOrder ? b.posTotalSeatNum - a.posTotalSeatNum : a.fieldOrder - b.fieldOrder;
    });
  }
  return items;
};

export const fixPlans = (plans, count) => {
  const items = [];
  for (let i = 0; i < (plans.length >= count ? plans.length : count); i++) {
    plans[i] ? items.push(plans[i]) : items.push(null);
  }
  return items;
};

export const objectToArray = (obj) => {
  const array = [];
  for (const key in obj) {
    if (obj[key]) {
      array.push(obj[key]);
    }
  }
  return array;
};

export const cleanObject = (obj, key) => {
  const array = objectToArray(obj);
  const newObject = {};
  array.forEach(item => {
    newObject[item[key]] = item;
  });
  return newObject;
};

export function getIndex(arr, key, value) {
  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) {
      index = i;
    }
  }
  return index;
}

export function mergeParams(paramsArr: any[]) {
  const inputDto: any = {};
  paramsArr.forEach(params => {
    for (const key in params) {
      if (params[key] !== '') {
        inputDto[key] = params[key];
      }
    }
  });
  return inputDto;
}

export function getBirthdayFromIdCard(idCard) {
  let birthday = '';
  if (idCard != null && idCard !== '') {
    if (idCard.length === 15) {
      birthday = '19' + idCard.substr(6, 6);
    } else if (idCard.length === 18) {
      birthday = idCard.substr(6, 8);
    }

    birthday = birthday.replace(/(.{4})(.{2})/, '$1-$2-');
  }

  return birthday;
}

export const unique = (arr, key) => {
  const obj = {};
  const array = [];
  arr.forEach(item => {
    obj[item[key]] = item;
  });
  for (const k in obj) {
    if (obj[k]) {
      array.push(obj[k]);
    }
  }
  return array;
};

export const checkRedirect = async (cartSvc) => {
  const cart = cartSvc.checkShoppingCart();

  return {
    status: !(cart.seats.length > 0 || cart.products.length > 0 || cart.points.length > 0 || cart.coupons.length > 0),
    error: {
      seats: cart.seats.length > 0,
      products: cart.products.length > 0,
      points: cart.points.length > 0,
      coupons: cart.coupons.length > 0
    }
  };
};

export const formatProducts = (products) => {
  products.forEach(item => {
    let nameResStr = item.cartResName;
    item.shopCartResContainList.forEach(contain => {
      if (nameResStr) {
        nameResStr = nameResStr + ',' + contain.nameRes;
      } else {
        nameResStr = contain.nameRes;
      }
    });
    item.nameResStr = nameResStr;
  });
  return products;
};

export const setTicketType = (selected, info, member, isOptionalPipe) => {
  if (!selected || !info) {
    return false;
  }
  const ticketType = info.ticketTypeList[0];
  for (const uid in selected) {
    if (selected[uid]) {
      const isOptional = isOptionalPipe.transform(selected[uid].ticketType, member);
      if (!isOptional) { // 如果选择了超出会员等级的座位，恢复为标准票类
        selected[uid].ticketType = ticketType;
        selected[uid].levelPrice = ticketType.levelPriceDTO.filter(item => {
          return selected[uid].resSeatLevelCode === item.seatLevelCode;
        })[0];
      }
    }
  }
  return selected;
};

export const isTrue = (value) => {
  return value !== undefined && value !== 'undefined' && value !== 'null' && value !== '';
};

export const getPassword = (origin) => {
  let str = hex_md5(origin);
  const salt = 'AIDATACOM';
  for (let i = 0; i < str.length; i++) {
    const start = 3 * (i + 1) + i;
    str = str.slice(0, start) + salt.charAt(i) + str.slice(start);
  }
  return hex_md5(str);
};

export const getBirthday = (birthday) => {
  const year = birthday.substr(0, 4);
  const month = birthday.substr(5, 2);
  const day = birthday.substr(8, 2);
  return {
    year,
    month,
    day
  };
};

export const isElectron = () => {
  // Renderer process
  // @ts-ignore
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }

  // Main process
  // @ts-ignore
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
};
