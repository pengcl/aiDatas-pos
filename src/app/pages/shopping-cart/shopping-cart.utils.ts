function getKey(item) {
  let key = item.uidResource + ':' + item.cartResPrice;
  if (item.shopCartResContainList) {
    item.shopCartResContainList.sort((a, b) => {
      return b.uidRes - a.uidRes;
    });
    // tslint:disable-next-line:variable-name
    item.shopCartResContainList.forEach(_item => {
      key = key + _item.uidRes + ':' + _item.priceRes;
    });
  }
  return key;
}

export const groupSame = (data) => {
  const selected = {};
  const items = [];
  data.forEach(item => {
    const key = getKey(item);
    if (selected[key]) {
      selected[key].count = selected[key].count + 1;
    } else {
      selected[key] = JSON.parse(JSON.stringify(item));
      selected[key].count = 1;
    }
    // tslint:disable-next-line:variable-name
    const _selected = {};
    // tslint:disable-next-line:variable-name
    const _items = [];
    if (selected[key].shopCartResContainList) {
      selected[key].shopCartResContainList.sort((a, b) => {
        return b.codeRes - a.codeRes;
      });
      // tslint:disable-next-line:variable-name
      selected[key].shopCartResContainList.forEach(_item => {
        // tslint:disable-next-line:variable-name
        const _key = _item.codeRes + ':' + _item.priceRes;
        if (_selected[_key]) {
          _selected[_key].count = _selected[_key].count + 1;
        } else {
          _selected[_key] = JSON.parse(JSON.stringify(_item));
          _selected[_key].count = 1;
        }
      });
      // tslint:disable-next-line:variable-name
      for (const _key in _selected) {
        if (_selected[_key]) {
          for (let i = 0; i < _selected[_key].count; i++) {
            const currItem = JSON.parse(JSON.stringify(_selected[_key]));
            currItem.count = 1;
            _items.push(currItem);
          }
        }
      }
      selected[key].shopCartResContainList = _items;
    }
  });
  for (const key in selected) {
    if (selected[key]) {
      items.push(selected[key]);
    }
  }
  return items;
};

export const listToTree = (items, keys) => {
  const is = [];
  const selected = {};
  items.forEach(item => {
    if (selected[item.cartResName]) {
      if (selected[item.cartResName].children.length === 0) {
        selected[item.cartResName].children.push({
          dto: selected[item.cartResName].dto,
          value: selected[item.cartResName].value,
          count: 1,
          children: [],
          isExpanded: false,
          isVisible: true
        });
      }
      selected[item.cartResName].count = selected[item.cartResName].count + 1;
      selected[item.cartResName].children.push({
        dto: {uid: item.uid, oldPrice: item.cartResPrice, price: item.cartResPrice},
        value: (() => {
          const value: any = {};
          keys.forEach(keyItem => {
            if (keyItem.code === 'newPrice') {
              value[keyItem.name] = item.cartResPrice;
            } else {
              value[keyItem.name] = item[keyItem.code];
            }
          });
          value.数量 = 1;
          return value;
        })(),
        count: 1,
        children: [],
        isExpanded: false,
        isVisible: true
      });
    } else {
      selected[item.cartResName] = {};
      selected[item.cartResName].dto = {uid: item.uid, oldPrice: item.cartResPrice, price: item.cartResPrice};
      selected[item.cartResName].value = (() => {
        const value: any = {};
        keys.forEach(keyItem => {
          if (keyItem.code === 'newPrice') {
            value[keyItem.name] = item.cartResPrice;
          } else {
            value[keyItem.name] = item[keyItem.code];
          }
        });
        value.数量 = 1;
        return value;
      })();
      selected[item.cartResName].isExpanded = false;
      selected[item.cartResName].isVisible = true;
      selected[item.cartResName].count = 1;
      selected[item.cartResName].children = [];
    }
  });
  for (const key in selected) {
    if (selected[key]) {
      is.push(selected[key]);
    }
  }
  return is;
};

export const groupToArray = (groupProducts) => {
  const items = [];
  groupProducts.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      // tslint:disable-next-line:variable-name
      const _item = JSON.parse(JSON.stringify(item));
      _item.count = 1;
      items.push(_item);
    }
  });
  return items;
};
