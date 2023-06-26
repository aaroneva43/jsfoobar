const factory = (type: 'local' | 'session') => {
  const store = type === 'local' ? localStorage : sessionStorage;
  return {
    get: function (key: string | string[]): any {
      if (Array.isArray(key)) {
        return key.reduce((acc, k) => {
          return Object.assign(acc, { [k]: JSON.parse(store.getItem(k)) });
        }, {});
      } else {
        return JSON.parse(store.getItem(key));
      }
    },
    set: function (key: string | Record<string, any>, value?: any) {
      if (typeof key == 'string') {
        store.setItem(key, JSON.stringify(value));
      } else if (typeof key === 'object') {
        for (var k in key) {
          store.setItem(k, JSON.stringify(key[k]));
        }
      }
    },
    rm: function (key: string | string[]) {
      if (Array.isArray(key)) {
        key.forEach((k) => {
          store.removeItem(k);
        });
      } else {
        store.removeItem(key);
      }
    },
  };
};

export const storage = {
  local: factory('local'),
  session: factory('session'),
};
