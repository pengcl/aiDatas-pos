export const getReprintResComboListData = (list, str) => {
  const ArrAll = [];
  list.forEach(item => {
    const itemA = {
      uid: item.uid,
      uidPosBill: item.uidPosBill,
      uidPosResCombo: item.uidPosResCombo,
      resComboType: item.resComboType,
      billResCode: item.billResCode,
      billResComboPrice: item.billResComboPrice,
      billResCompbPriceOri: item.billResCompbPriceOri,
      billResName: item.billResName,
      nameResStr: ''
    };
    if (item.resComboContainList && item.resComboContainList.length > 0){
      const CartResContainList = getDeletData(item.resComboContainList, 'uid', 'sSum', '');
      const reslist = CartResContainList[2];
      const res = [];
      reslist.forEach(nameItem => {
        res.push(nameItem.posResourceName + str + nameItem.sSum) ;
      });
      itemA.nameResStr = res.join( ',');
      ArrAll.push(itemA);
    } else{
      itemA.nameResStr = '';
      ArrAll.push(itemA);
    }
  });
  const ArrAll2 = getDeletData(ArrAll,  'uidPosResCombo', 'pSum', '');
  return ArrAll2[2];
};

export const getResComboListData = (list, str) => {
  const ArrAll = [];
  list.forEach(item => {
    const itemA = {
      billResCode: item.billResCode || '',
      billResComboPrice: item.billResComboPrice || item.billResPrice,
      billResCompbPriceOri: item.billResCompbPriceOri || item.billResPriceOri,
      billResName: item.billResName || item.billResName,
      uid: item.uid,
      uidPosBill: item.uidPosBill,
      uidPosResCombo: item.uidPosResCombo || item.uidPosResource,
      nameResStr: ''
    };
    if (item.resComboContainList && item.resComboContainList.length > 0){
      const CartResContainList = getDeletData(item.resComboContainList, 'uidPosResource', 'sSum', '');
      const reslist = CartResContainList[2];
      const res = [];
      reslist.forEach(nameItem => {
        res.push(nameItem.posResourceName + str + nameItem.sSum) ;
      });
      itemA.nameResStr = res.join( ',');
      ArrAll.push(itemA);
    } else{
      itemA.nameResStr = '';
      ArrAll.push(itemA);
    }
  });
  return ArrAll;
};

export const getDeletData = (list, id, sum, price) => {
  const listA = [];  // 找出所有的id
  const listB = [];  // id去重
  const listAB = []; // 合并相同id的数据
  list.forEach(it => {
    listA.push(it[id]);
  });
  listA.forEach(item => {
    if (listB.indexOf(item) === -1){
      listB.push(item);
    }
  });
  listB.forEach(item => {
    let sumIndex = 0;
    let sameItem = {
      priceAll : 0,
      billResCompbPriceOri : 0,
      pSum : 0,
      billResComboPrice : 0
    };
    let index = 0;

    list.forEach(pit => {
      const pitem = pit;
      if (pitem[id] === item){
        if (sumIndex === 0){
          sameItem = pitem;
        }
        sumIndex++;
      }
      if (index === (list.length - 1)){
        sameItem[sum] = sumIndex;
        sameItem.billResCompbPriceOri = sameItem.pSum * sameItem.billResComboPrice;
        listAB.push(sameItem);
      }
      index++;
    });
  });

  return [listA, listB, listAB];
};

