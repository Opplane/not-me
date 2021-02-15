import { equals } from "../equals/equals-schema";
import { objectOf } from "../object/object-of-schema";
import { InferType, Schema } from "../schema";
import { array } from "./array-schema";

describe("Array Schema", () => {
  it("Should pass with correct value", () => {
    const objSchema: Schema<
      { [key: string]: "a" | "b" } | undefined
    > = objectOf([equals(["a"] as const), equals(["b"] as const)]);

    const schema: Schema<Array<InferType<typeof objSchema>>> = array([
      objectOf([equals(["a"] as const), equals(["b"] as const)]),
    ]).defined();

    expect(schema.validate([undefined, undefined])).toEqual({
      errors: false,
      value: [undefined, undefined],
    });
  });
});
