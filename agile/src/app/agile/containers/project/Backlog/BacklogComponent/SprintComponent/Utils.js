export function deBounce(delay) {
  let timeout;
  debugger;
  return (fn, that) => {
    if (timeout) {
      console.log(timeout);
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(fn, delay, that);// (自定义函数，延迟时间，自定义函数参数1，参数2)
  };
};
