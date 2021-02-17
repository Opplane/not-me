import { equals } from "./equals-schema";

describe("Equals Schema", () => {
  it("Should accept input when it matches allowed values", () => {
    const schema = equals(["a"] as const)
      .nullable()
      .defined();

    const result = schema.validate(null);

    if (result.errors) {
      throw new Error();
    } else {
      const value: "a" | null = result.value;

      expect(value).toBe(value);
    }
  });

  it("Should reject input when it does not match allowed values", () => {
    const schema = equals(["a", null] as const);

    const result = schema.validate("b");

    expect(result).toEqual({
      errors: true,
      messagesTree: ["Input is not equal to any of the allowed values"],
    });
  });
});
