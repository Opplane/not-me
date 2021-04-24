import { BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { number } from "../../schemas/number/number-schema";
import { object } from "../../schemas/object/object-schema";
import { Schema } from "../../schemas/schema";
import { ValidationSchema } from "./validation-schema.decorator";
import { NotMeValidationPipe } from "./validation.pipe";

const schema: Schema<DTO> = object({
  a: number().defined(),
}).defined();

@ValidationSchema(schema)
class DTO {
  a!: number;
}

describe("Validation Pipe", () => {
  it("Should not validate custom parameter decorators data", () => {
    const reflector = new Reflector();

    const pipe = new NotMeValidationPipe(reflector);

    const validated = pipe.transform(
      { b: "string" },
      { type: "custom", metatype: DTO }
    );

    expect(validated).toEqual({ b: "string" });
  });

  it("Should validate body, param and query decorators data", () => {
    const reflector = new Reflector();

    const pipe = new NotMeValidationPipe(reflector);

    expect(() =>
      pipe.transform({ b: "string" }, { type: "body", metatype: DTO })
    ).toThrowError(BadRequestException);

    expect(() =>
      pipe.transform({ b: "string" }, { type: "param", metatype: DTO })
    ).toThrowError(BadRequestException);

    expect(() =>
      pipe.transform({ b: "string" }, { type: "query", metatype: DTO })
    ).toThrowError(BadRequestException);
  });
});
