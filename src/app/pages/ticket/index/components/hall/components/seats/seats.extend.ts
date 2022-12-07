export const COUNTS = [
  {label: '可售', value: 0, code: ''},
  {label: '已售', value: 0, code: 'sold'},
  {label: '选中', value: 0, code: 'selected'},
  {label: '预订', value: 0, code: 'reserved'},
  {label: '网售', value: 0, code: 'e-sold'},
  {label: '锁定', value: 0, code: 'locked'},
  /*{label: '网取', value: 0, code: 'e-taken'},*/
  {label: '坏座', value: 0, code: 'broken'}
  /*{label: '网锁', value: 0, code: 'e-locked'}*/
];

export const getMost = (seats): any => {// 获取画布极限的四个位置
  const most = {
    left: null,
    right: null,
    top: null,
    bottom: null
  };
  seats.forEach((seat) => {
    const x = Number(seat.resSeatX);
    const y = Number(seat.resSeatY);
    if (most.left !== null) {
      if (most.left > x) {
        most.left = x;
      }
    } else {
      most.left = x;
    }
    if (most.right !== null) {
      if (most.right <= x) {
        most.right = x + 50;
      }
    } else {
      most.right = x + 50;
    }
    if (most.top !== null) {
      if (most.top > y) {
        most.top = y;
      }
    } else {
      most.top = y;
    }
    if (most.bottom !== null) {
      if (most.bottom <= y) {
        most.bottom = y + 50;
      }
    } else {
      most.bottom = y + 50;
    }
  });
  return most;
};

export const getCounts = (seats) => {
  const counts = JSON.parse(JSON.stringify(COUNTS));
  seats.forEach(seat => {
    if (seat.status === 0) {// 可售 checked
      counts[0].value = counts[0].value + 1;
    }
    if (seat.resSeatSaleStatus === -1) { // 已售 checked
      counts[1].value = counts[1].value + 1;
    }
    if (seat.resSeatReserve && seat.isOwned) {// 选中 checked
      counts[2].value = counts[2].value + 1;
    }
    if (seat.resSeatReserve === 2) {// 预订 // checked
      counts[3].value = counts[3].value + 1;
    }
    if (seat.resSeatSaleCh === 3 && seat.resSeatSaleStatus === -1) { // 网售
      counts[4].value = counts[4].value + 1;
    }
    if (seat.resSeatReserve === 1 && seat.resSeatSaleStatus !== -1 && seat.status !== -1 && !seat.isOwned) {// 锁定
      counts[5].value = counts[5].value + 1;
    }
    if (seat.status === -1) {// 坏座
      counts[6].value = counts[6].value + 1;
    }
  });
  counts[0].value = counts[0].value - counts[1].value - counts[2].value - counts[3].value - counts[5].value;
  return counts;
};

export const getStyle = (seat, most) => {
  const style: any = {};
  style.left = (seat.resSeatX - most.left) + 'px';
  style.top = (seat.resSeatY - most.top) + 'px';
  style.background = seat.regionColor;
  style.border = '1px solid ' + seat.regionColorFrame;
  return style;
};

export const getRegion = (seat, regions) => {
  let seatRegion = null;
  regions.forEach(region => {
    if (region.planRegionMemCardEntityList && region.uid === seat.uidRegion) {
      region.planRegionMemCardEntityList.forEach(regionSeat => {
        if (regionSeat.uidField === seat.uidField) {
          regionSeat.planRegionMemCardEntityList = region.planRegionMemCardEntityList;
          seatRegion = regionSeat;
        }
      });
    }
  });
  return seatRegion;
};

export const getScale = (thisContainer, most) => {
  let scale = 1;
  if (!thisContainer) {
    return scale;
  }
  if (!thisContainer.nativeElement.offsetWidth) {
    return scale;
  } else {
    const container = { // 容器
      w: thisContainer.nativeElement.offsetWidth,
      h: thisContainer.nativeElement.offsetHeight
    };
    const canvas = { // 画布
      w: most.right - most.left, // 宽
      h: most.bottom - most.top // 高
    };
    const ratio = {
      w: canvas.w / container.w,
      h: canvas.h / container.h
    };
    if (ratio.w >= 1 && ratio.h >= 1) {
      scale = (ratio.w >= ratio.h ? 1 / ratio.w : 1 / ratio.h);
    } else if (ratio.w >= 1 && ratio.h < 1) {
      scale = 1 / ratio.w;
    } else if (ratio.w < 1 && ratio.h >= 1) {
      scale = 1 / ratio.h;
    } else if (ratio.w < 1 && ratio.h < 1) {
      scale = (ratio.w >= ratio.h ? 1 / ratio.w : 1 / ratio.h);
    }
    return scale;
  }
};

export const isNeedMember = (seat, regions, plan) => {
  let isNeed = false;
  const region = regions.filter(item => item.uid === seat.uidRegion)[0];
  if (region && (region.reCustomerLmt === 1 || region.reCustomerLmt === 2)) {
    if (region.reCustomerLmtCancel === 1) {
      const now = new Date();
      const limitTime = region.reCustomerLmtCancelMm;
      now.setMinutes(now.getMinutes() + limitTime);
      const startTime = new Date(plan.posStartTime).getTime();
      isNeed = now.getTime() < startTime;
    } else {
      isNeed = true;
    }
  }
  return isNeed;
};

export const containMemberLevel = (seat, levelUid, regions) => {
  let isContain = false;
  if (levelUid !== null && levelUid !== '') {
    const region = regions.filter(item => item.uid === seat.uidRegion)[0];
    if (region) { // 如果座位有区域信息
      if (region.reCustomerLmt === 1) {// 全部会员都适用
        isContain = true;
      } else {
        const entities = region.planRegionMemCardEntityList;
        if (entities != null && entities.length > 0 && JSON.stringify(entities).indexOf(levelUid) !== -1) {
          isContain = true;
        }
      }
    } else {
      isContain = true;
    }
  }
  return isContain;
};

export const getSelectedFromShoppingCart = (seatsFromShoppingCart, planSeats, ticketTypes) => {
  const selected = {};
  seatsFromShoppingCart.forEach(seat => {
    selected[seat.uidPosResSeat] = seat;
  });
  const seats = planSeats.filter(seat => {
    return selected[seat.uid];
  });
  const currentSelected = {};
  seats.forEach(seat => {
    const uidTicketType = selected[seat.uid].uidTicketType;
    const ticketType = ticketTypes.filter(res => res.uidTicketType === uidTicketType)[0];
    seat.ticketType = ticketType;
    seat.levelPrice = seat.ticketType.levelPriceDTO.filter(item => {
      return seat.resSeatLevelCode === item.seatLevelCode;
    })[0];
    currentSelected[seat.uid] = seat;
  });
  return currentSelected;
};
