import { equals } from "../equals/equals-schema";
import { objectOf } from "../object/object-of-schema";
import { InferType, Schema } from "../schema";
import { array } from "./array-schema";

describe("Array Schema", () => {
  const objSchema: Schema<
      { [key: string]: "a" | "b" } | undefined
    > = objectOf([equals(["a"] as const)]);

  const schema: Schema<Array<InferType<typeof objSchema>>> = array([
    objSchema
  ]).defined();

  it("Should pass with correct values", () => {
    expect(schema.validate([undefined, undefined])).toEqual({
      errors: false,
      value: [undefined, undefined],
    });

    expect(schema.validate([undefined, { someProp: 'a' }])).toEqual({
      errors: false,
      value: [undefined, { someProp: 'a' }],
    });
  });

  it("Should fail when input is not an array", () => {
    expect(schema.validate(null)).toEqual({
      errors: true,
      messagesTree: ["Input is null"],
    });
  });

  it("Should fail with wrong values", () => {
    expect(schema.validate([undefined, undefined, { someProp: 'c' }])).toEqual({
      errors: true,
      messagesTree: {
        2: { someProp: ["Input is not equal to any of the allowed values"] }
      },
    });
  });
});
