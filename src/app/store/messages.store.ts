import {inject, Injectable, signal} from '@angular/core';
import {MessagesService} from '../services/messages.service';
import {SearchRequest} from '../domain/request/search.request';
import {MessageResponse} from '../domain/response/message.response';

@Injectable({providedIn: 'root'})
export class MessageStore {

  private _messages = signal<MessageResponse[]>([]);
  private _loading = signal(false);

  messages = this._messages.asReadonly();
  loading = this._loading.asReadonly();

  private service: MessagesService = inject(MessagesService);


  search(request: SearchRequest) {
    this._loading.set(true);

    this.service.search(request).subscribe({
      next: (data: MessageResponse[]) => {
        this._messages.set(data);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      }
    });
  }
}
