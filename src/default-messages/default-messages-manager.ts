import { DefaultMessages } from "./default-messages-types";

class DefaultMessagesManagerImpl {
  private defaultMessages?: DefaultMessages;

  setDefaultMessages(defaultMessages: DefaultMessages) {
    this.defaultMessages = defaultMessages;
  }

  getDefaultMessages() {
    return this.defaultMessages;
  }

  resetDefaultMessages() {
    this.defaultMessages = undefined
  }
}

export const DefaultMessagesManager = new DefaultMessagesManagerImpl();
