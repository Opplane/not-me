import { equals } from "../equals/equals-schema";
import { object } from "./object-schema";

describe("Object Schema - When", () => {
  it("Should accept object values with the correct union type descriminations", () => {
    const schema = object({
      common: equals(["common"]),
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

    type Expected = { common: string } & (
      | { a: "a"; c: number }
      | { a: "b"; d: boolean }
    );

    const input: Expected = { common: "common", a: "a", c: 0 };

    const result = schema.validate(input);

    if (result.invalid) {
      throw new Error();
    } else {
      const value: Expected = result.value;

      expect(value).toEqual(input);
    }

    const input2: Expected = { common: "common", a: "b", d: false };
    const result2 = schema.validate(input2);

    if (result2.invalid) {
      throw new Error();
    } else {
      const value: Expected = result2.value;

      expect(value).toEqual(input2);
    }
  });
});
