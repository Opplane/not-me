import { number } from "../number/number-schema";
import { object } from "../object/object-schema";

describe("Base Schema", () => {
  it("Fail with multiple error messages", () => {
    const schema = object({
      a: number()
        .integer()
        .defined()
        .test((v) => v < 1000, "Must be smaller than 1000"),
    }).defined();

    expect(schema.validate({ a: 1000.1 })).toEqual({
      errors: true,
      messagesTree: {
        a: ["Input is not an integer", "Must be smaller than 1000"],
      },
    });
  });

  it("Fail with single error message on abort early", () => {
    const schema = object({
      a: number()
        .integer()
        .defined()
        .test((v) => v < 1000, "Must be smaller than 1000"),
    }).defined();

    expect(schema.validate({ a: 1000.1 }, { abortEarly: true })).toEqual({
      errors: true,
      messagesTree: {
        a: ["Input is not an integer"],
      },
    });
  });

  it("Send transformed value to chained validations that follow", () => {
    const schema = number()
      .integer()
      .transform(() => true)
      .test((v) => v === true, "Must be true");

    expect(schema.validate(1, { abortEarly: true })).toEqual({
      errors: false,
      value: true,
    });
  });
});
