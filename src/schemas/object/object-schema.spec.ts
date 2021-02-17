import { equals } from "../equals/equals-schema";
import { FilterResult } from "../schema";
import { object } from "./object-schema";

describe("Object Schema", () => {
  it("Should accept the object input", () => {
    const schema = object({
      a: object({ b: object({}) }),
    });

    const result = schema.validate({});

    expect(result).toEqual({ errors: false, value: {} });
  });

  it("Should fail with non-object input", () => {
    const schema = object({
      a: object({ b: object({}) }),
    });

    const result = schema.validate({ a: 2 });

    expect(result).toEqual({
      errors: true,
      messagesTree: {
        a: ["Input is not an object"],
      },
    });
  });

  it("Should fail with non-defined object input", () => {
    const schema = object({
      a: object({ b: object({}) }).defined(),
    });

    const result = schema.validate({});

    expect(result).toEqual({
      errors: true,
      messagesTree: { a: ["Input is not defined"] },
    });
  });

  it("empty schema - empty object - pass", () => {
    const schema = object({}).defined();

    const result: FilterResult<{}> = schema.validate({});

    expect(result).toEqual({
      errors: false,
      value: {},
    });
  });

  it("strip unknown fields", () => {
    const schema = object({ a: equals(["a"] as const).defined() }).defined();

    const result: FilterResult<{ a: "a" }> = schema.validate({
      a: "a",
      b: "b",
    });

    expect(result).toEqual({
      errors: false,
      value: { a: "a" },
    });
  });
});
