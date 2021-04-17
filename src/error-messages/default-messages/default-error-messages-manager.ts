import { DefaultErrorMessages } from "./default-error-messages-types";

class DefaultErrorMessagesManagerImpl {
  private defaultMessages: DefaultErrorMessages;

  constructor() {
    this.defaultMessages = {};
  }

  setDefaultMessages(defaultMessages: DefaultErrorMessages): void {
    this.defaultMessages = defaultMessages;
  }

  getDefaultMessages(): DefaultErrorMessages {
    return this.defaultMessages;
  }
}

export const DefaultErrorMessagesManager = new DefaultErrorMessagesManagerImpl();
