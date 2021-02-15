import { equals } from "../equals/equals-schema";
import { FilterResult } from "../schema";
import { objectOf } from "./object-of-schema";

describe("Object Of Schema", () => {
  const schema = objectOf([equals(["a"] as const)]);

  it("valid", () => {
    const result: FilterResult<{ [key: string]: "a" }> = schema.validate({
      b: "a",
    });

    expect(result).toEqual({
      errors: false,
      value: { b: "a" },
    });
  });

  it("errors", () => {
    const result: FilterResult<{ [key: string]: "a" }> = schema.validate({
      b: "b",
    });

    expect(result).toEqual({
      errors: true,
      messagesTree: {
        b: ["Field did not match any of the provided schemas"],
      },
    });
  });

  it("is not an object", () => {
    const result: FilterResult<{ [key: string]: "a" }> = schema.validate(true);

    expect(result).toEqual({
      errors: true,
      messagesTree: ["Input is not an object"],
    });
  });
});
