import {Routes} from '@angular/router';
import {MainComponent} from './pages/main/main.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {ArchitectureComponent} from './pages/architecture/architecture.component';

export const routes: Routes = [
  {path: '', component: MainComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'architecture', component: ArchitectureComponent},
];
