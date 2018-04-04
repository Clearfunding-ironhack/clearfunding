
module.exports.getRemainingTime = (dueDate) => {
  let now = new Date();
  return remainingTime = (new Date(dueDate) - now + 1000) / 1000;
}