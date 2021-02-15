import { equals } from "../equals/equals-schema";
import { FilterResult, InferType } from "../schema";
import { object } from "./object-schema";

describe("Object Schema - When", () => {
  describe("Simple Union", () => {
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

    it("valid", () => {
      type Expected = { common: string } & (
        | { a: "a"; c: number }
        | { a: "b"; d: boolean }
      );

      const input: Expected = { common: "common", a: "a", c: 0 };

      const result: FilterResult<Expected> = schema.validate(input);

      if (result.errors) {
        throw new Error();
      } else {
        const value: Expected = result.value;

        expect(value).toEqual(input);
      }

      const input2: Expected = { common: "common", a: "b", d: false };
      const result2 = schema.validate(input2);

      if (result2.errors) {
        throw new Error();
      } else {
        const value: Expected = result2.value;

        expect(value).toEqual(input2);
      }
    });

    it("errors", () => {
      const input = { common: "common", a: "b", d: 0 };

      const result = schema.validate(input);

      expect(result).toEqual({
        errors: true,
        messagesTree: {
          d: ["Input is not equal to any of the allowed values"],
        },
      });
    });
  });
});
