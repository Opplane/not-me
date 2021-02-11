import { DefaultMessages } from "./default-messages-types";

class DefaultMessagesManagerImpl {
  private defaultMessages?: DefaultMessages;

  setDefaultMessages(defaultMessages: DefaultMessages) {
    this.defaultMessages = defaultMessages;
  }

  getDefaultMessages() {
    return this.defaultMessages;
  }
}

export const DefaultMessagesManager = new DefaultMessagesManagerImpl();
