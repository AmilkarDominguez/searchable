import {Message} from '../models/message';

export interface MessageResponse extends Message {
  highlights: Map<string, string[]>;
  score: number;
}
