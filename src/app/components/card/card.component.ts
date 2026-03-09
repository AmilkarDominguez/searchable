import {Component, Input} from '@angular/core';
import {MessageResponse} from '../../domain/response/message.response';
import {DecimalPipe} from '@angular/common';
import {TooltipDirective} from '../../directives/tooltip.directive';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    DecimalPipe,
    TooltipDirective,
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input()
  message!: MessageResponse;
}
