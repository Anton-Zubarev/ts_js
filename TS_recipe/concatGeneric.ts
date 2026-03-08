/*
ОБОБЩЕНИЕ МЕТОДА
задача: создать метод, котрый собирает все параметры (включая массивы) в обдин одномерный массив
concat1([1, 2], [3], 5) // [1, 2, 3, 5]
*/

/*
на таких задачах 
1. определяить - деалать на .push или на .reduce
2. вспомнить параметры reduce и подобрать женерик
  тут T | Array<T>
*/

// вложенные массивы останутся массивами
const concat1 = <T>(...items: (T | Array<T>)[]): T[] => {
  let res: T[] = [];
  res = <T[]>items.reduce((acc: T[], current: T | Array<T>) => {
    return acc.concat(current);
  }, []);
  return res;
};

console.log(".concat1", concat1([1, 2], [3], 5));

/*
Для распаковки вложенных массивов лучше ввести тип 
type Arr<T> = Array<T | Arr<T>>; //(T | Arr<T>)[]
а в методе использовать рекурчию
  Array.isArray(current) ? concat2(
*/

type Arr<T> = Array<T | Arr<T>>; // (T | Arr<T>)[]

const concat2 = <T>(...items: Arr<T>): T[] => {
  const res = <T[]>items.reduce((acc: T[], current) => {
    return acc.concat(Array.isArray(current) ? concat2(...current) : current);
  }, []);
  return res;
};

console.log(".concat2: ", concat2([1, 2], [3, [31]], 5));

/*
можно сделать на .flat
console.log("concat3: ", [[1, 2], [3, [31]], 5].flat());
*/
console.log("concat3: ", [[1, 2], [3, [31]], 5].flat());

/*
Вот женерик на .flat
Сигнатура незамылена - = <T>(...items: Arr<T>): T[]
*/
const concat3 = <T>(...items: Arr<T>): T[] => {
  return (<T[]>items.flat(20)) as T[];
};
