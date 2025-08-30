
export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface ChatMessage {
  id: number;
  sender: Sender;
  text: string;
  quickReplies?: string[];
}
