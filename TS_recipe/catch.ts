function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

async function getUser(id: number) {
  await wait(1000);
  if (id === 1) {
    return { id: 1, name: "anton" };
  }
  if (id === 3) {
    throw new CustomError("404: user is not found");
  }
  throw new Error("404: user is not found");
}

//это буду менять на catchError
async function mainTry() {
  let user;
  try {
    user = await getUser(1);
  } catch (ex) {}
  console.log(user);
}

function catchError<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      return [error];
    });
}

function catchErrorTyped<T, E extends new (message?: string) => Error>(
  promise: Promise<T>,
  errorsToCatch?: E[],
): Promise<[undefined, T] | [InstanceType<E>]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      if (errorsToCatch == undefined) return [error];
      if (errorsToCatch.some((e) => error instanceof e)) return [error];

      throw error;
    });
}

class CustomError extends Error {
  name = "CustomError";
  extraProp = "ERROR: test";
}

async function main() {
  const [errorN, userN] = await catchError(getUser(1));
  const [errorE, userE] = await catchError(getUser(2));
  debugger;

  const [errorET, userET] = await catchErrorTyped(getUser(3), [CustomError]);
  debugger;
}

main();
