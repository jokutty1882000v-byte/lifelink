import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeMode } from '@core/services/theme.service';

@Component({
  selector: 'll-settings-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold">Settings</h1>
      <mat-card class="!rounded-2xl mt-4">
        <mat-card-content class="!p-6">
          <h2 class="font-medium mb-3">Appearance</h2>
          <mat-button-toggle-group [value]="theme.mode()" (change)="theme.set($event.value)">
            <mat-button-toggle value="light">Light</mat-button-toggle>
            <mat-button-toggle value="dark">Dark</mat-button-toggle>
            <mat-button-toggle value="system">System</mat-button-toggle>
          </mat-button-toggle-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SettingsPage {
  readonly theme = inject(ThemeService);
  protected readonly ThemeMode!: ThemeMode;
}
