// поковырял debounce с ИИ
/*
1. простой вариант
2. с промисом
3. с react
3.2  Race Conditions  -> AbortController внутри useEffect, чтобы отменять предыдущий сетевой запрос
4. готовые хуки реакт
*/

/*
@note Debounce
(дребезг) — это метод программирования, который ограничивает частоту вызова функции. Он гарантирует, что код выполнится только один раз после того, как с момента последнего вызова прошло определенное время (период «бездействия»). 
Как это работает
Каждый раз, когда вызывается «обернутая» функция, таймер ожидания сбрасывается. Реальное выполнение произойдет только тогда, когда поток вызовов прекратится на заданный интервал времени. 

Основные сценарии использования
Поиск (Autocomplete): Чтобы не отправлять запрос на сервер после каждой введенной буквы.
Изменение размера окна (resize): Чтобы тяжелые пересчеты верстки не происходили сотни раз в секунду во время растягивания окна.
Валидация форм: Проверка корректности данных только после того, как пользователь закончил ввод.
Защита кнопок: Предотвращение двойных кликов по кнопке «Отправить». 

Debounce vs Throttle
Метод 	Поведение	Когда использовать
Debounce	Ждет паузы. Группирует серию вызовов в один.	Поиск, сохранение черновика, валидация.
Throttle	Выполняет функцию не чаще одного раза в заданный интервал времени.	Скроллинг (scroll), отслеживание движения мыши.
*/
function debounce(func, wait) {
  let timeout;

  return function (...args) {
    const context = this;
    // Очищаем предыдущий таймер, если он был запущен
    clearTimeout(timeout);

    // Устанавливаем новый таймер
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Пример использования:
const handleInput = debounce((e) => {
  console.log("Поиск по:", e.target.value);
}, 500);

document.querySelector("input").addEventListener("input", handleInput);

/*
Реализация debounce на промисах полезна, когда вы хотите использовать await 
в месте вызова, чтобы дождаться результата функции (например, ответа от сервера).
Главная сложность здесь — решить, что делать с «отмененными» вызовами. 
Обычно их либо просто игнорируют, либо отклоняют через reject.
*/
/*
Вариант 1: С разрешением (Resolve) только последнего вызова
В этом случае все предыдущие вызовы «повиснут» и никогда не завершатся, 
а resolve сработает только для самого последнего действия после паузы. 
*/
function debounceP(func, wait) {
  let timeout;

  return function (...args) {
    const context = this;

    // Возвращаем новый промис при каждом вызове
    return new Promise((resolve) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        // Выполняем функцию и возвращаем результат через resolve
        resolve(func.apply(context, args));
      }, wait);
    });
  };
}

// Использование:
const fetchData = debounceP(
  (query) => fetch(`/api?q=${query}`).then((r) => r.json()),
  500,
);

// В async функции:
const result = await fetchData("apple");

/*
Вариант 2: С отменой (@note Reject) предыдущих вызовов
Это более корректный подход для работы с асинхронными цепочками, 
так как он явно сообщает коду, что вызов был перебит новым вводом.
*/
function debounceWithReject(func, wait) {
  let timeout;
  let previousReject;

  return function (...args) {
    const context = this;

    // Если есть активный промис, "отменяем" его
    if (previousReject) previousReject({ cancelled: true });

    return new Promise((resolve, reject) => {
      previousReject = reject;
      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        try {
          const result = await func.apply(context, args);
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          previousReject = null;
        }
      }, wait);
    });
  };
}
/*
В чем подвох?
Обычный debounce просто выполняет действие. debounce на промисах создает 
новую цепочку промисов на каждый чих, что может привести к утечкам памяти, 
если вызовов тысячи, а промисы не закрываются (как в Варианте 1).
*/
//================================================
//================================================
//================================================
/*
В @note React для поля ввода с запросом на сервер debounce через промисы обычно не нужен.
Промис в debounce полезен, когда вам нужен результат выполнения функции прямо 
в месте вызова (const data = await debouncedFetch()). Но в React данные 
обычно сохраняются в state.
Вот два лучших способа реализовать это:
1. Классический Debounce (рекомендуемый)
Здесь мы дебаунсим саму функцию запроса. Мы используем useMemo или useCallback, 
чтобы функция не пересоздавалась при каждом рендере.
*/
import { useState, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce'; // Популярная библиотека

function SearchComponent() {
  const [results, setResults] = useState([]);

  // 1. Создаем дебаунс-функцию (выполнится через 500мс после стоп-ввода)
  const debouncedSearch = useMemo(
    () => debounce(async (query) => {
      if (!query) return;
      console.log('Запрос к API:', query);
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      setResults(data);
    }, 500),
    []
  );

  const handleChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value); // Просто вызываем, не ожидая промис
  };

  return <input type="text" onChange={handleChange} />;
}
/*
2. Через кастомный хук @note useDebounce (более "реактивный")
Этот подход лучше разделяет логику: один стейт для ввода, другой (отложенный) 
для запуска эффекта.
*/
import { useState, useEffect } from 'react';

// Хук, который возвращает значение с задержкой
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler); // Очистка при изменении value
  }, [value, delay]);

  return debouncedValue;
}

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Делаем запрос к API здесь
      fetch(`/api/search?q=${debouncedSearch}`)
        .then(res => res.json())
        .then(setResults);
    }
  }, [debouncedSearch]); // Сработает только когда debouncedSearch изменится

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
/*
Использование @note AbortController вместе с дебаунсом — это «золотой 
стандарт» для полей поиска. Это гарантирует, что:
Запрос не уйдет слишком рано (благодаря дебаунсу).
Если старый запрос еще летит, а новый уже начался — старый будет 
немедленно отменен браузером.
Вот как это выглядит в React через useEffect:
Пример с кастомным хуком useDebounce
Этот подход самый чистый, так как AbortController идеально вписывается 
в механизм очистки (cleanup) эффекта.
*/
import { useState, useEffect } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // Получаем отложенное значение (например, через 500мс)
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    // Если строка пустая, не делаем запрос
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    // 1. Создаем контроллер для текущего запроса
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/search?q=${debouncedQuery}`, { signal });
        const data = await response.json();
        setResults(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Запрос отменен:', debouncedQuery);
        } else {
          console.error('Ошибка запроса:', err);
        }
      }
    };

    fetchData();

    // 2. Функция очистки: вызывается ПЕРЕД следующим запуском эффекта
    // Она отменит старый запрос, если debouncedQuery изменится снова
    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <input 
      value={query} 
      onChange={(e) => setQuery(e.target.value)} 
      placeholder="Начните печатать..."
    />
  );
}
/*
Почему это важно?
Экономия ресурсов: Сервер всё равно получит запрос, но браузер закроет соединение и не будет тратить ресурсы на обработку ответа.
Никаких Race Conditions: Вы никогда не увидите в результатах данные от старого запроса, который случайно пришел позже нового.
Чистота стейта: Вы обновляете setResults только тогда, когда запрос действительно актуален.
*/
