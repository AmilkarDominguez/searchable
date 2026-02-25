import { Component } from '@angular/core';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { ListComponent } from '../../components/list/list.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SearchBarComponent, ListComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {}
