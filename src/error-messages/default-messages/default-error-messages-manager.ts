import { DefaultErrorMessages } from "./default-error-messages-types";

class DefaultErrorMessagesManagerImpl {
  private defaultMessages?: DefaultErrorMessages;

  setDefaultMessages(defaultMessages: DefaultErrorMessages) {
    this.defaultMessages = defaultMessages;
  }

  getDefaultMessages() {
    return this.defaultMessages;
  }

  resetDefaultMessages() {
    this.defaultMessages = undefined;
  }
}

export const DefaultErrorMessagesManager = new DefaultErrorMessagesManagerImpl();
