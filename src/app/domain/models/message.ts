export interface Message {
  message_id: number;
  sender: string;
  space_type: string;
  channel: string;
  thread_id: number;
  thread_title: string;
  text: string;
}
