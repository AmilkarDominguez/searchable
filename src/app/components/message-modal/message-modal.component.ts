import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Message} from '../../domain/models/message';

export type MessageForm = Omit<Message, 'message_id'>;

@Component({
  selector: 'app-message-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-modal.component.html',
  styleUrl: './message-modal.component.scss',
})
export class MessageModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() message: Message | null = null;
  @Output() save = new EventEmitter<{ id?: number; data: MessageForm }>();
  @Output() cancel = new EventEmitter<void>();

  form: MessageForm = this.emptyForm();

  get isEdit(): boolean {
    return this.message !== null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] || changes['visible']) {
      this.form = this.message
        ? {
            sender: this.message.sender,
            space_type: this.message.space_type,
            channel: this.message.channel,
            thread_id: this.message.thread_id,
            thread_title: this.message.thread_title,
            text: this.message.text,
          }
        : this.emptyForm();
    }
  }

  private emptyForm(): MessageForm {
    return {sender: '', space_type: '', channel: '', thread_id: 0, thread_title: '', text: ''};
  }

  submit() {
    this.save.emit({id: this.message?.message_id, data: {...this.form}});
  }

  onCancel() {
    this.cancel.emit();
  }
}
