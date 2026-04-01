function class2() {
  const tree = {
    value: 1,
    children: [
      { value: 2, children: [{ value: 3 }] },
      { value: 4, children: [{ value: 5 }, { value: 6 }] },
    ],
  };

  //простой перебор значений
  function getTreeValues1(node) {
    const result = [];
    Object.values(node).forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((xx) => result.push(...getTreeValues1(xx)));
      } else {
        result.push(item);
      }
    });
    return result;
  }

  //flatMap
  function getTreeValues2(nodeArray) {
    return nodeArray.flatMap((item) => {
      const { children, ...nodeWithoutChildren } = item;
      return [
        nodeWithoutChildren.value,
        ...(children ? getTreeValues2(children) : []),
      ];
    });
  }

  const values1 = getTreeValues1(tree); // [1,2,3,4,5,6]
  console.log(values1);

  const values2 = getTreeValues2([tree]); // [1,2,3,4,5,6]
  console.log(values2);
}

class2();
