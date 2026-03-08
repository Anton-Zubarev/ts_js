/*
ОБОБЩЕНИЕ МЕТОДА
задача: создать обобщенный метод .reduce
*/

/*
на таких задачах 
1. определяить - деалать на .push или на .reduce
2. вспомнить параметры reduce и подобрать женерик
  тут T | Array<T>
*/

const reduce1 = <T, R = T>(
  arr: T[],
  fn: (acc: R, current: T, ind?: number, arr?: T[]) => R,
  init: R,
): R => {
  let acc1: R = init;
  arr.forEach((el, ind) => {
    acc1 = fn(acc1, el, ind, arr);
  });
  let res = acc1;
  return res;
};

let arrr1 = [1, 2, 3];
let red = reduce1(
  arrr1,
  (a, c) => {
    a = a + c;
    return a;
  },
  9,
);
console.log(".reduce1: ", red); // 9 + [1+2+3]  -> 15
