import { FormikErrors } from "formik";
import { ErrorMessagesTree } from "src/error-messages/error-messages-tree";
import { InferType, Schema } from "src/schemas/schema";

type FormikFormSchema = Schema<{ [key: string]: unknown }>;

function traverseErrorMessagesTree<T>(current: {
  [key: string]: ErrorMessagesTree;
}): FormikErrors<T> {
  const convertedObj: FormikErrors<any> = {};

  for (const key in current) {
    const prop = current[key];

    if (prop instanceof Array) {
      convertedObj[key] = prop[0];
    } else if (typeof prop === "object" && Object.keys(prop).length > 0) {
      const convertedProp = traverseErrorMessagesTree(prop);

      convertedObj[key] = convertedProp;

      return convertedObj;
    }
  }

  return convertedObj;
}

export function formikResolver<S extends FormikFormSchema>(schema: S) {
  return (values: unknown): void | FormikErrors<InferType<S>> => {
    const result = schema.validate(values);

    if (result.errors) {
      if (
        result.messagesTree instanceof Array ||
        result.messagesTree === undefined
      ) {
        return undefined;
      } else {
        return traverseErrorMessagesTree<InferType<S>>(result.messagesTree);
      }
    } else {
      return undefined;
    }
  };
}