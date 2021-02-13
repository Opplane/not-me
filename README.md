# U-Knot-Me

> Easy and type-safe validation

## Features:

- Planned out to be used and shared **between backend and frontend**
- **Powerful type inference**: no need to write types manually. Even *Discriminated Union types* are guessed from your schemas.
  * Example of a *Discriminated Union Type*:
  ```typescript
  type UnionType = {
    discriminator: 'has-a',
    a: string
  } | {
    discriminator: 'has-b',
    b: boolean
  }
  ```
- Simple **DSL-like** API
- **Implementation that is easy to read and change**, so you can fork it and extend it without much hassle.
- **No need for _try/catches_**: the final result will always be returned as the transformed input, or a tree of error messages
