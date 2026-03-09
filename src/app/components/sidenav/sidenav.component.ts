import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update((v) => !v);
  }

  close() {
    this.isOpen.set(false);
  }
}
