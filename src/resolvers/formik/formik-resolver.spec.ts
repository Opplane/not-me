import { FormikErrors } from "formik";
import { number } from "src/schemas/number/number-schema";
import { object } from "src/schemas/object/object-schema";
import { InferType } from "src/schemas/schema";
import { formikResolver } from "./formik-resolver";

describe("Formik resolver", () => {
  it("Return undefined if form value is valir", () => {
    const schema = object({
      a: object({
        b: number().defined(),
      }).defined(),
    }).defined();

    const resolver = formikResolver(schema);

    expect(resolver({ a: { b: 2 } })).toEqual(undefined);
  });

  it("Return a FormikError if form value is invalid", () => {
    const schema = object({
      a: number().defined(),
    }).defined();

    const resolver: (
      value: unknown
    ) => void | FormikErrors<InferType<typeof schema>> = formikResolver(schema);

    expect(resolver({ a: "not a number" })).toEqual({ a: expect.any(String) });
  });
});
