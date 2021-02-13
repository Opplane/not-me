import { DefaultInvalidationMessages } from "./default-invalition-messages-types";

class DefaultInvalidationMessagesManagerImpl {
  private defaultMessages?: DefaultInvalidationMessages;

  setDefaultMessages(defaultMessages: DefaultInvalidationMessages) {
    this.defaultMessages = defaultMessages;
  }

  getDefaultMessages() {
    return this.defaultMessages;
  }

  resetDefaultMessages() {
    this.defaultMessages = undefined
  }
}

export const DefaultInvalidationMessagesManager = new DefaultInvalidationMessagesManagerImpl();
