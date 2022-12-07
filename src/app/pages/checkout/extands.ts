export const getPaid = (cart) => {
  let items = [];
  if (cart) {
    if (cart.shopCartTicketDTOList && cart.shopCartTicketDTOList.length > 0) {
      cart.shopCartTicketDTOList.forEach(item => {
        items.push({
          payModeCode: 'coupon',
          payModeName: item.ticketName,
          billPayAmount: item.ticketAmount,
          ticketCode: item.ticketCode,
          ticketName: item.ticketName,
          ticketMode: item.ticketMode
        });
      });
    }
    const prePayList = cart.prePayList;
    if (prePayList && prePayList.length > 0) {
      items = items.concat(prePayList);
    }
  }
  return items;
};
