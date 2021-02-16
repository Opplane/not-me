import { Schema } from "../schema";
import { string } from "./string-schema";

describe("String Schema", () => {
  it("Fail when value is not a string", () => {
    const schema: Schema<string> = string().defined();

    expect(schema.validate({})).toEqual({
      errors: true,
      messagesTree: ["Input is not a string"],
    });
  });

  it("Fail when it's not filled string", () => {
    const schema: Schema<string> = string().filled();

    expect(schema.validate("   ")).toEqual({
      errors: true,
      messagesTree: ["Field must be filled"],
    });
  });
});
