import { FormikErrors } from "formik";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { InferType, Schema } from "../../schemas/schema";

type FormikFormSchema = Schema<{ [key: string]: unknown }>;

type TraversedFormErrors = string | undefined | TraversedFormErrorsObject;

type TraversedFormErrorsObject = {
  [key: string]: TraversedFormErrors;
};

export function messagesTreeToFormikErrors(formErrorMessagesTree: {
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
  ): TraversedFormErrors => {
    if (current.length === 0) {
      return undefined;
    } else {
      const firstElement = current[0];

      if (firstElement instanceof Array) {
        return parseArray(firstElement);
      } else if (typeof firstElement === "object") {
        return parseObject(firstElement);
      } else {
        return firstElement;
      }
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
        return messagesTreeToFormikErrors(result.messagesTree) as FormikErrors<
          InferType<S>
        >;
      }
    } else {
      return undefined;
    }
  };
}
