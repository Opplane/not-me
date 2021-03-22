import { FormikErrors } from "formik";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { InferType, Schema } from "../../schemas/schema";

type FormikFormSchema = Schema<{ [key: string]: unknown }>;

type TraversedFormErrors = string | TraversedFormErrorsObject;

type TraversedFormErrorsObject = {
  [key: string]: TraversedFormErrors | undefined;
};

function traverseErrorMessagesTree(formErrorMessagesTree: {
  [key: string]: AnyErrorMessagesTree;
}): TraversedFormErrorsObject {
  const parseObject = (current: { [key: string]: AnyErrorMessagesTree }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed: TraversedFormErrorsObject = {};

    Object.keys(current).forEach((key) => {
      const field = formErrorMessagesTree[key];

      if (field instanceof Array) {
        parsed[key] = parseArray(field);
      } else if (typeof field === "object") {
        parsed[key] = parseObject(field);
      }
    });

    return parsed;
  };

  const parseArray = (
    current: Array<string | AnyErrorMessagesTree>
  ): string | undefined => {
    let hasObject = false;

    for (const field of current) {
      hasObject = typeof field === "object";
    }

    if (hasObject) {
      return undefined;
    } else {
      return current[0] as string;
    }
  };

  return parseObject(formErrorMessagesTree);
}

export function formikResolver<S extends FormikFormSchema>(schema: S) {
  return (values: unknown): void | FormikErrors<InferType<S>> => {
    const result = schema.validate(values);

    if (result.errors) {
      if (result.messagesTree instanceof Array) {
        return undefined;
      } else {
        return traverseErrorMessagesTree(result.messagesTree) as FormikErrors<
          InferType<S>
        >;
      }
    } else {
      return undefined;
    }
  };
}
