import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LoadingService } from '../../core/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [MatProgressBarModule],
  template: `
    @if (loading.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
  `
})
export class LoadingBarComponent {
  readonly loading = inject(LoadingService);
}

