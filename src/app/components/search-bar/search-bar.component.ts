import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MessageStore} from '../../store/messages.store';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {

  public text!: string;
  public vectorized: boolean = false;
  private store: MessageStore = inject(MessageStore);

  search() {
    this.store.search({
      text: this.text,
      vectorized: this.vectorized
    });
  }

}
