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
- **No need for _try/catches_**: the final result will always be returned as the transformed input, or a tree of error messages. This way, there is no need to rearrange the flow to accomodate the _try/catch_, while reminding you to deal with validation errors
- **Easy to extend**. You can create a new schema just by extending the classes from the ones provided here
- **Implementation that is easy to read and change**. If you really need so, you can fork this library and change it without much hassle
- **API inspired** by `yup` and `joi`
- **Maintained by [Opplane](https://opplane.com/)**, a company from the Intelligent Apps and Connectivity sectors

## Quick links:

- [CONTRIBUTING](CONTRIBUTING.md)

## Motivation behind this package

This package was built in order to fix some shortcomings (specially with _type safety_) that many validation libraries have. Most validation libraries try to do a lot, and their code starts getting confusing and with a lot of back and forths. As consequence, unsolved Github issues start pilling up, improving the libraries ourselves becomes hard since there are too many flows and a lot of history behind them, and a lot of broad types (like `any` or `object`) start surfacing and undermining the _type safety_ of a project.

Having a separate type and a schema for each entity is also not a viable solution, since if one of them is changed, the developer has to remember to update the other one too, and that opens doors to human error.

Our take on validation with `not-me` is almost to provide you with enough boilerplate for you to build your own validations schemas. This way, it's easy to maintain and improve this package.

## How to use it

### Imports:

Keeping an app's code splitted into small lazy-loaded chunks is a priority for frontend development. Since legacy systems and some bundlers, like React Native's _Metro_, do not provide tree-shaking, this package does not provide a single `index.js` import with all the code bundled in it. Instead, you are encouraged to import what you need from within the directories the package has. For example, the schemas are inside the `lib/schemas` directory, so if you want to import a schema for an object type, you need to import it like this `import { object } from 'not-me/lib/schemas/object/object-schema`

### Type utilities (at `not-me/lib/schemas/schema`):

- **`InferType<typeof schema>`**: get the output type of a schema
- **`Schema<T>`**: dictates that a value is a schema that has an output type of `T`

### Form library resolvers:

This package includes validation resolvers to work with the following form libraries:

- [Formik](#formik)

#### <a name="formik"></a> Formik

```tsx
import { formikResolver } from "not-me/lib/resolvers/formik/formik-resolver";

// (...)

<Formik /* (...) */ validate={formikResolver(notMeSchema)}>
  {/* (...) */}
</Formik>;
```

### Union typed schemas:

```typescript
/*
  schema will output
  { common: string } & ({ a: "a"; c: number } | { a: "b"; d: boolean })

  `as const` statements are needed to infer the literal value (like 'a' | 'b')
  instead of a generic value like `string`
*/
const schema = object({
  common: equals(["common"]).defined(),
  a: equals(["a", "b"] as const).defined(),
})
  .union((v) => {
    if (v.a === "a") {
      return {
        a: equals(["a"] as const).defined(),
        c: equals([0]).defined(),
      };
    } else {
      return {
        a: equals(["b"] as const).defined(),
        d: equals([false]).defined(),
      };
    }
  })
  .defined();
```

### How it works under the hood:

When you set up a schema, you're just pilling up filter functions that will test and transform your initial value. There are 3 types of filter functions, and they run in this order:

- **Type filter** will validate if your input is in a specific type (example: a number, an object, an array, etc...)
- **Shape filters** will validate the fields in your value. This only applies to object and array values
- **Test and Transform filters** will run basic _true_ or _false_ checks on your value, or transform your value

You should also define what kind of nullable values you want to be able to get throught at the end of the schema chain, by calling `nullable()` or `defined()`.

### Creating a schema of my own:

Just extend the class of the closest schema there is for your type of value, and call the `transform()` and `test()` methods in your new schema to setup the validation logic that will be run. Can be either in it's _constructor_, or you can add new methods to your schema.

- Here's how an Integer Schema could be implemented:

```typescript
import { NumberSchema } from "not-me/lib/schemas/number/number-schema";

class IntegerSchema extends NumberSchema {
  constructor(message?: string) {
    super();

    this.test(
      (input) => Number.isInteger(input),
      message || "Input is not an integer"
    );
  }
}

/*
  Just a wrapper function so you don't have to write `new IntegerSchema()`.
  It's more readable if you just call `integer()` inside a complex schema.
*/
export function integer(message?: string) {
  return new IntegerSchema(message);
}
```
