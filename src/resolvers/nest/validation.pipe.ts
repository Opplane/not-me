import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { throwError } from "../../utils/throw-error";
import {
  SupportedValidationSchema,
  VALIDATION_SCHEMA_KEY,
} from "./validation-schema.decorator";

@Injectable()
export class NotMeValidationPipe implements PipeTransform<unknown> {
  constructor(private readonly reflector: Reflector) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const metatype =
      metadata.metatype ||
      throwError(
        "No metatype defined. You must use an ES6 class annotated with @ValidationSchema as argument type"
      );

    const schema =
      this.reflector.get<SupportedValidationSchema | undefined>(
        VALIDATION_SCHEMA_KEY,
        metatype
      ) ||
      throwError(
        "Metatype " + metatype.name + " is not annotated with @ValidationSchema"
      );

    const result = schema.validate(value, {
      abortEarly: true,
    });

    if (result.errors) {
      throw new BadRequestException(result.messagesTree);
    } else {
      return result.value;
    }
  }
}
