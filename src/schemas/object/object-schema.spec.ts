import { object } from "./object-schema";
import { FilterResult } from "../schema";

describe("Object Schema", () => {
  it("Should accept the object input", () => {
    const schema = object({
      a: object({ b: object({}) }),
    });

    const result = schema.validate({});

    expect(result).toEqual({ invalid: false, value: {} });
  });

  it("Should fail with non-object input", () => {
    const schema = object({
      a: object({ b: object({}) }),
    });

    const result = schema.validate({ a: 2 });

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

    const result = schema.validate({});

    expect(result).toEqual({
      invalid: true,
      messagesTree: { a: expect.any(String) },
    });
  });

  it("Should accept the object when added new fields after the original schema creation", () => {
    const schema = object({
      a: object({ b: object({}) }),
    })
      .addFields({ c: object({}).defined() })
      .defined();

    const result: FilterResult<{ a?: { b?: {} }, c: {} }> = schema.validateSync({
      c: {}
    });

    expect(result).toEqual({
      invalid: false,
      value: { c: {} },
    });
  });
});
