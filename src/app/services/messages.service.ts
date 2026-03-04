import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Message} from '../domain/models/message';
import {SearchRequest} from '../domain/request/search.request';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private http: HttpClient = inject(HttpClient);
  private readonly API_URL: string;

  constructor() {
    this.API_URL = '/api/messages';
  }

  search(request: SearchRequest): Observable<Message[]> {
    return this.http.post<Message[]>(`${this.API_URL}/search`, request);
  }
}
