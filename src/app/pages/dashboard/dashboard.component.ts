import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardStore} from '../../store/dashboard.store';
import {MessageModalComponent, MessageForm} from '../../components/message-modal/message-modal.component';
import {Message} from '../../domain/models/message';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MessageModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  store = inject(DashboardStore);

  modalVisible = signal(false);
  selectedMessage = signal<Message | null>(null);
  deletingId = signal<number | null>(null);

  ngOnInit() {
    this.store.loadPage(0);
  }

  openCreate() {
    this.selectedMessage.set(null);
    this.modalVisible.set(true);
  }

  openEdit(message: Message) {
    this.selectedMessage.set(message);
    this.modalVisible.set(true);
  }

  closeModal() {
    this.modalVisible.set(false);
  }

  onSave(event: { id?: number; data: MessageForm }) {
    if (event.id !== undefined) {
      this.store.update(event.id, event.data);
    } else {
      this.store.create(event.data);
    }
    this.closeModal();
  }

  confirmDelete(id: number) {
    this.deletingId.set(id);
  }

  cancelDelete() {
    this.deletingId.set(null);
  }

  doDelete(id: number) {
    this.store.remove(id);
    this.deletingId.set(null);
  }

  goToPage(page: number) {
    this.store.loadPage(page);
  }

  get pages(): number[] {
    return Array.from({length: this.store.totalPages()}, (_, i) => i);
  }
}
