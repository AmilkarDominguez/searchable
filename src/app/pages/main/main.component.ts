import { Component } from '@angular/core';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SearchBarComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {}
