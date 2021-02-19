import { DefaultErrorMessages } from "./default-error-messages-types";

class DefaultErrorMessagesManagerImpl {
  private defaultMessages?: DefaultErrorMessages;

  setDefaultMessages(defaultMessages: DefaultErrorMessages): void {
    this.defaultMessages = defaultMessages;
  }

  getDefaultMessages(): DefaultErrorMessages | undefined {
    return this.defaultMessages;
  }

  resetDefaultMessages(): void {
    this.defaultMessages = undefined;
  }
}

export const DefaultErrorMessagesManager = new DefaultErrorMessagesManagerImpl();
