import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchRequest} from '../domain/request/search.request';
import {MessageResponse} from '../domain/response/message.response';

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
}
