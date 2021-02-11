import { object, ObjectSchema } from "./object-schema";

describe("Object Schema", () => {
  it("Should accept the object input", () => {
    const schema = object({
      a: object({ b: object({}) }),
    });

    const result = schema.validateSync({});

    if (result.invalid) {
    } else {
      const b = result.value;
    }

    expect(result).toEqual({ a: {} });
  });
});
