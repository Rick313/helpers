/**
 * @param {{path: string, [key:string|symbol]: any}} routes
 * @param {srting} path
 */
const matcher = (routes, path) => {
  const regexp = (path) =>
    new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
  const potential = (routes, path) =>
    routes.map((route) => ({route, result: path.match(regexp(route.path))}));

  const match = potential(routes, path).find((maybe) => maybe.result !== null);
  if (!match) return;

  const query = {};
  new URLSearchParams(path).forEach((value, key) =>
    value !== "" ? (query[key] = value) : null
  );

  const params = {};
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g));
  keys
    .map((result) => result[1])
    .forEach((key, idx) => (params[key] = values[idx].split(/[?&]/)[0]));
  match["params"] = params;
  match["query"] = query;
  match["url"] = path;
  return match;
};

export {matcher};
