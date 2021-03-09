import { FormikErrors } from "formik";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { InferType, Schema } from "../../schemas/schema";

type FormikFormSchema = Schema<{ [key: string]: unknown }>;

function traverseErrorMessagesTree<T>(current: {
  [key: string]: AnyErrorMessagesTree;
}): FormikErrors<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertedObj: FormikErrors<any> = {};

  for (const key in current) {
    const prop = current[key];

    if (prop instanceof Array) {
      convertedObj[key] = prop[0];
    } else if (typeof prop === "object") {
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
      if (result.messagesTree instanceof Array) {
        return undefined;
      } else {
        return traverseErrorMessagesTree<InferType<S>>(result.messagesTree);
      }
    } else {
      return undefined;
    }
  };
}
