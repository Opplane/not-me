import { InferType } from "src/types/infer-type"
import { object } from "./object-schema"

describe('Object Schema - When', () => {
  it('Should accept object values with fields that are decided dynamically', () => {
    const schema = object({
      a: object({b: object({})})
    })
      .when((v) => { 
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

    expect(schema.validateSync({ c: {} })).toEqual({
      invalid: false,
      value: {
        c: {}
      }
    })

    expect(schema.validateSync({ a: {}, d: {} })).toEqual({
      invalid: false,
      value: {
        a: {},
        d: {}
      }
    })
  })
})