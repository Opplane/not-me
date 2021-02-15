import { number } from "./number/number-schema"
import { object } from "./object/object-schema"

describe("Base Schema", () => {
  it("Fail with multiple error messages", () => {
    const schema = object({
      a: number().integer().test((v) => v < 1000, "Must be smaller than 1000").defined()
    }).defined()

    expect(schema.validate({ a: 1000.1 })).toEqual({
      errors: true,
      messagesTree: {
        a: ["Input is not an integer", "Must be smaller than 1000"]
      }
    })
  })

  it("Fail with single error message on abort early", () => {
    const schema = object({
      a: number().integer().test((v) => v < 1000, "Must be smaller than 1000").defined()
    }).defined()

    expect(schema.validate({ a: 1000.1 }, { abortEarly: true })).toEqual({
      errors: true,
      messagesTree: {
        a: ["Input is not an integer"]
      }
    })
  })
})
