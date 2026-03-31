function task1() {

  interface Order {
    customerId: string;
    amount: number;
    status: "pending" | "completed";
  }
  
  const orders: Order[] = [
    { customerId: "A", amount: 100, status: "completed" },
    { customerId: "B", amount: 200, status: "completed" },
    { customerId: "A", amount: 50, status: "completed" },
    { customerId: "C", amount: 300, status: "pending" },
    { customerId: "B", amount: 50, status: "pending" },
  ];

  //Функция возвращает массив customerId
  //у который есть завершенный заказ
  //не более N строк
  //в порядке убывания суммы всех заказов
  function getIds(orders: Order[], n: number): string[] {
    //встроенная функция
    //let groupped = Object.groupBy(orders, (item) => item.customerId);

    let grOrders = orders.reduce((acc: Order[], cur, ind, arr) => {
      const item = acc.find((x) => x.customerId == cur.customerId);
      if (item) {
        item.amount += cur.amount;
        if (cur.status === "completed") item.status = cur.status;
      } else {
        acc.push(cur);
      }
      return acc;
    }, []);

    grOrders = grOrders.sort((a, b) => a.amount - b.amount);

    return grOrders.slice(0, n).map((x) => x.customerId);
  }

  const result = getIds(orders, 2);
  console.log(result);
}

task1();
