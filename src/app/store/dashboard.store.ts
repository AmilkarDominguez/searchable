import {computed, inject, Injectable, signal} from '@angular/core';
import {MessagesService} from '../services/messages.service';
import {Message} from '../domain/models/message';

@Injectable({providedIn: 'root'})
export class DashboardStore {

  private service = inject(MessagesService);

  private _messages = signal<Message[]>([]);
  private _total = signal(0);
  private _page = signal(0);
  private _loading = signal(false);

  readonly size = 10;

  messages = this._messages.asReadonly();
  total = this._total.asReadonly();
  page = this._page.asReadonly();
  loading = this._loading.asReadonly();
  totalPages = computed(() => Math.ceil(this._total() / this.size));

  loadPage(page: number = 0) {
    this._loading.set(true);
    this._page.set(page);
    this.service.getAll(page, this.size).subscribe({
      next: (res) => {
        this._messages.set(res.content);
        this._total.set(res.totalElements);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  create(data: Omit<Message, 'message_id'>) {
    this.service.create(data).subscribe({
      next: () => this.loadPage(this._page()),
    });
  }

  update(id: number, data: Partial<Message>) {
    this.service.update(id, data).subscribe({
      next: () => this.loadPage(this._page()),
    });
  }

  remove(id: number) {
    this.service.remove(id).subscribe({
      next: () => this.loadPage(this._page()),
    });
  }
}
