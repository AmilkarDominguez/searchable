import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchRequest} from '../domain/request/search.request';
import {MessageResponse} from '../domain/response/message.response';
import {Message} from '../domain/models/message';
import {PagedResponse} from '../domain/response/page.response';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private http: HttpClient = inject(HttpClient);
  private readonly API_URL: string;

  constructor() {
    this.API_URL = '/api/messages';
  }

  search(request: SearchRequest): Observable<MessageResponse[]> {
    return this.http.post<MessageResponse[]>(`${this.API_URL}/search`, request);
  }

  getAll(page: number, size: number): Observable<PagedResponse<Message>> {
    return this.http.get<PagedResponse<Message>>(this.API_URL, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  create(data: Omit<Message, 'message_id'>): Observable<Message> {
    return this.http.post<Message>(this.API_URL, data);
  }

  update(id: number, data: Partial<Message>): Observable<Message> {
    return this.http.put<Message>(`${this.API_URL}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
