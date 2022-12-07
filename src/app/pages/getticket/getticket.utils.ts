export const getBookDatas = (datas) => {
  let k = 0;
  datas.forEach(item => {

    item.posShopCartTakeInfomationDTOList.forEach(it => {
        const seats = it.takeSeatInfomationDTOList;
        const arr = [];
        const uidSeats = [];
        seats.forEach(i => {
          arr.push(i.cartSeatRow + '排' + i.cartSeatCol + '号');
          uidSeats.push(i.uidPosShopCartPlanSeat);
        });
        it.content = '共' + seats.length + '个座位：' + arr.join('、');
        it.uidSeats = uidSeats;
        it.releaseTime = it.takeSeatInfomationDTOList[0].cartSeatReleaseTime;
        it.showTimeStart = item.showTimeStart;
        it.index = k;
        k++;
    });
  });
  return datas;
};
