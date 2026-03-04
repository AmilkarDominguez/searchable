import {Component, inject} from '@angular/core';
import {CardComponent} from '../card/card.component';
import {MessageStore} from '../../store/messages.store';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {

  private messageStore = inject(MessageStore);

  messages = this.messageStore.messages;
  loading = this.messageStore.loading;
}
