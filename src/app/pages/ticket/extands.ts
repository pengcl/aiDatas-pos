export const renderCurrentPanel = (items, target, cb) => {
  if (items && target) {
    items.forEach((item, filmIndex) => {
      item.plans.forEach((plan, planIndex) => {
        if (plan.uidPlan === target.uidPlan) {
          cb(item);
        }
      });
    });
  }
};

export const sortPlans = (name, dir, minor) => {
  return (o, p) => {
    let a, b;
    if (o && p && typeof o === 'object' && typeof p === 'object') {
      a = o[name];
      b = p[name];
      if (a === b) {
        return typeof minor === 'function' ? minor(o, p) : 0;
      }
      if (typeof a === typeof b) {
        if (dir === 'asc') {
          return a < b ? -1 : 1;
        } else {
          return a > b ? -1 : 1;
        }
      }
      if (dir === 'desc') {
        return typeof a < typeof b ? -1 : 1;
      } else {
        return typeof a > typeof b ? -1 : 1;
      }
    } else {
      throw new Error(('error'));
    }
  };
};
