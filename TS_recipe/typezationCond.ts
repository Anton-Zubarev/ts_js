/*
Мальчики/Девочки с разными полями.
при наличии общего поля gender скрипт будет понимать 
о ком речь
*/
type Props = {
  name: string;
} & (MeleProps | FemaleProps);

type MeleProps = { gender: "Male"; salary: number };
type FemaleProps = { gender: "Female"; age: number };
// age нельзя, salary - можно
const p = { name: "", gender: "Male", age: 33 } as Props;
const pp = (p: Props) => {};
pp({ name: "aa", gender: "Female", salary: 22 });
