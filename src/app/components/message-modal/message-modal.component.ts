import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Message} from '../../domain/models/message';

export type MessageForm = Omit<Message, never>;

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
            message_id: this.message.message_id,
            author: this.message.author,
            chat: this.message.chat,
            text: this.message.text,
          }
        : this.emptyForm();
    }
  }

  private emptyForm(): MessageForm {
    return {message_id: null!, author: '', chat: '', text: ''};
  }

  submit() {
    this.save.emit({id: this.message?.message_id, data: {...this.form}});
  }

  onCancel() {
    this.cancel.emit();
  }
}
