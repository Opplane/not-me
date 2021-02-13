import { FilterResult, Schema } from "../schema"
import { object } from "./object-schema"

describe('Object Schema - When', () => {
  it('Should accept object values with fields that are decided dynamically', () => {
    const schema = object({
      a: object({})
    })
      .union((v) => { 
        if(v.a === undefined) {
          return {
            c: object({}).defined()
          }
        } else {
          return {
            d: object({}).defined()
          }
        }
      })

    const result = schema.validate({ c: {} })

    if(result.invalid) {}
    else {
      const a: { a: undefined, c: {} } | { a: {}, d: {} } = result.value

      console.log(a)
    }

    expect().toEqual({
      invalid: false,
      value: {
        c: {}
      }
    })

    expect(schema.validate({ a: {}, d: {} })).toEqual({
      invalid: false,
      value: {
        a: {},
        d: {}
      }
    })
  })
})