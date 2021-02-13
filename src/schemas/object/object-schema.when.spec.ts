import { equals } from "../equals/equals-schema";
import { object } from "./object-schema";

describe("Object Schema - When", () => {
  it("Should accept object values with fields that are decided dynamically", () => {
    const schema = object({
      common: equals([new Date()]),
      a: equals(["a", "b"] as const),
    }).union((v) => {
      if (v.a === "a") {
        return {
          a: equals(["a"] as const),
          c: equals([0]),
        };
      } else {
        return {
          a: equals(["b"] as const),
          d: equals([false]),
        };
      }
    });

    const result = schema.validate({ c: {} });

    if (result.invalid) {
      throw new Error();
    } else {
      const value:
        | ({ common: Date } & { a: "a"; c: number })
        | { a: "b"; d: boolean } = result.value;

      expect(value).toEqual({
        c: {},
      });
    }

    const result2 = schema.validate({ a: {}, d: {} });

    if (result2.invalid) {
      throw new Error();
    } else {
      const value: { a: "a"; c: number } | { a: "b"; d: boolean } =
        result.value;

      expect(value).toEqual({
        a: {},
        d: {},
      });
    }
  });
});
