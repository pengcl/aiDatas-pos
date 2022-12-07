export const getEntityValue = (entities, key): string => {
  let value = '';
  entities.forEach(item => {
    if (item.conditionCode === key) {
      value = item.conditionValue;
    }
  });
  return value;
};

export const countMemberSeat = (selected) => {
  let count = 0;
  for (const uid in selected) {
    if (selected[uid] && selected[uid].ticketType.uidMemCardLevels) {
      count = count + 1;
    }
  }
  return count;
};
