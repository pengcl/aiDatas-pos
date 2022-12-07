const isThisWeek = (date) => {
    const today = new Date();
    const day = today.getDay();
    console.log(day);
    return day;
}

console.log(isThisWeek());
