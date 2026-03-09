/* ТИПИЗАЦИЯ */

const aObj = { a: "a", b: "b" } as const;

const getProperty = <T, K extends keyof T>(obj: T, key: K) => {
  return obj[key];
};

var prop = getProperty(aObj, "m"); // error - нет m в aObj

type AType = (typeof aObj)[keyof typeof aObj];
// "a" | "b"

const getProperty1 = (arg: AType) => {};
const atype: AType = aObj.a; // тут aObj должен быть as const;
getProperty1(atype);

const bObj = { a: "a", b: 1 };
// BType и CType поти одинаковы, но CType можно уточнить
type BType = typeof bObj;
type CType = { readonly [K in keyof typeof bObj]?: (typeof bObj)[K] } & {
  x: any;
};
const ctype: CType = { a: "a", b: 2, x: "xx" };
//то же, пояснее
type O = { readonly name: string; age?: number };
type WritableO<T> = { -readonly [K in keyof T]-?: T[K] };
const o: O = { name: "anton" };
const no = <WritableO<O>>o;
no.age = 34;
no.name = "anton1";
console.log("o no:", { o, no }); // o===no -> true

type User = {
  id: number;
  name: string;
  age: number;
};

const user: User = { id: 1, name: "Anton", age: 33 };
type UserTransformed = {
  [K in keyof User as `get${Capitalize<K>}`]: () => User[K];
};
const aa: UserTransformed = {
  getAge: () => 33,
  getId: () => 1,
  getName: () => "az",
};
aa.getAge();

/*
Если есть громоздкий сложный тип,
то такой тип-преобразователь упростит его
Pretify<T>
*/
type ComplexType = {
  a: string;
  b: number;
} & Omit<{ c: boolean } & Record<"d", string[]>, "c">;

type ShowMe = ComplexType;

type Pretify<T> = {
  [K in keyof T]: T[K];
} & {};

type ShowMeSimple = Pretify<ComplexType>;
/* {
    a: string;
    b: number;
    d: string[];
} */
