# U-Knot-Me

> Easy and type-safe validation

## Features:

- Planned out to be used and shared **between backend and frontend**
- **Powerful type inference**: no need to write types manually. Even _Discriminated Union types_ are guessed from your schemas.
  - Example of a _Discriminated Union Type_:
  ```typescript
  type UnionType =
    | {
        discriminator: "has-a";
        a: string;
      }
    | {
        discriminator: "has-b";
        b: boolean;
      };
  ```
- Simple **DSL-like** API
- **Implementation that is easy to read and change**, so you can fork it and extend it without much hassle.
- **No need for _try/catches_**: the final result will always be returned as the transformed input, or a tree of error messages

## How it works under the hood:

- When you set up a schema, you're just pilling up filter functions that will test and transform your initial value. There are 3 types of filter functions, and they run in this order:
  - **Type filter** will validate if your input is from a certain type (example: a number, an object, an array, etc...)
  - **Shape filters** will validate the fields in your value. This only applies to object and array values
  - **Test and Transform filters** will run basic _true_ or _false_ checks on your value, or transform your value

## Creating a schema of my own:

- Just extend the class of the closest schema there is for your type of value, and use the `transform()` and `test()` functions to setup the logic that will be run in your new schema.
