import {Component, Input} from '@angular/core';
import {Message} from '../../domain/models/message';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input()
  message!: Message;
}
