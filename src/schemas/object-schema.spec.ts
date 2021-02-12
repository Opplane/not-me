import { object, ObjectSchema } from "./object-schema";

describe("Object Schema", () => {
  it("Should accept the object input", () => {
    const schema = object({
      a: object({ b: object({}) }),
    });

    const result = schema.validateSync({});

    expect(result).toEqual({ invalid: false, value: {} });
  });

  it("Should fail with non-object input", () => {
    const schema = object({
      a: object({ b: object({}) }),
    });

    const result = schema.validateSync({ a: 2 });

    expect(result).toEqual({
      invalid: true,
      messagesTree: {
        a: expect.any(String),
      },
    });
  });

  it("Should fail with non-defined object input", () => {
    const schema = object({
      a: object({ b: object({}) }).defined(),
    });

    const result = schema.validateSync({});

    expect(result).toEqual({ invalid: true, messagesTree: { a: expect.any(String) } });
  });
});