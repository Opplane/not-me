# Not-Me

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
- **No need for _try/catches_**: the final result will always be returned as the transformed input, or a tree of error messages
- **Easy to extend**. You can create a new schema just by extending the classes from the ones provided here.
- **Implementation that is easy to read and change**. If you really need so, you can fork this library and change it without much hassle.

## How it works under the hood:

- When you set up a schema, you're just pilling up filter functions that will test and transform your initial value. There are 3 types of filter functions, and they run in this order:

  - **Type filter** will validate if your input is from a certain type (example: a number, an object, an array, etc...)
  - **Shape filters** will validate the fields in your value. This only applies to object and array values
  - **Test and Transform filters** will run basic _true_ or _false_ checks on your value, or transform your value

  You should also define what kind of nullable values can get throught at the end of the schema chain, by calling `nullable()` or `defined()`.

## Creating a schema of my own:

- Just extend the class of the closest schema there is for your type of value, and call the `transform()` and `test()` methods in your new schema to setup the validation logic that will be run. Can be either in it's _constructor_, or you can add new methods to your schema.
