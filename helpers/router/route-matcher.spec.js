import {matcher} from "./route-matcher";

describe("Url matcher", () => {
  const mock = [
    {path: "/home"},
    {path: "/user"},
    {path: "/user/:id/profile"},
    {path: "/user/:id"},
  ];
  const tested = matcher(mock, "/user/42&name=John");

  it("should be defined and return and object with key route, result, params, url, query", () => {
    expect(matcher).toBeDefined();
    expect(tested).toBeDefined();
    expect(typeof tested === "object").toBe(true);
    expect(typeof tested.route).toBeDefined();
    expect(typeof tested.result).toBeDefined();
    expect(typeof tested.query).toBeDefined();
    expect(typeof tested.params).toBeDefined();
    expect(typeof tested.url).toBeDefined();
  });
  it("should have a key url and url is a string", () => {
    expect(tested.url).toBeDefined();
    expect(typeof tested.url === "string").toBe(true);
  });
  it("should have a key params and his value is an object with key id and value '42'", () => {
    expect(typeof tested.params === "object").toBe(true);
    expect(tested.params.id).toBeDefined();
    expect(tested.params.id).toBe("42");
  });
  it("should have a key query and his value is an object with key name and value 'John'", () => {
    expect(typeof tested.query === "object").toBe(true);
    expect(tested.query.name).toBeDefined();
    expect(tested.query.name).toBe("John");
  });
  it("should have a key route and his value is an object with key path and his value is a string", () => {
    expect(tested.route).toBeDefined();
    expect(typeof tested.route === "object").toBe(true);
    expect(tested.route.path).toBeDefined();
    expect(typeof tested.route.path === "string").toBe(true);
  });
  it("should have a key result", () => {
    expect(tested.result).toBeDefined();
  });
});
