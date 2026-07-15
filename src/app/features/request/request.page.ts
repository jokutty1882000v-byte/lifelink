import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ALL_BLOOD_GROUPS, BloodGroup } from '@core/models/blood-group.enum';
import { BloodRequestService } from '@core/services/blood-request.service';
import { LocationService } from '@core/services/location.service';
import { AuthStore } from '@state/auth.store';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';

@Component({
  selector: 'll-request-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    FormErrorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold">New Blood Request</h1>
      <p class="text-sm text-gray-500">Broadcasts to matching donors nearby. Emergencies are auto-prioritized.</p>

      <mat-card class="!rounded-2xl mt-4">
        <mat-card-content class="!p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <mat-form-field appearance="outline">
              <mat-label>Blood group needed</mat-label>
              <mat-select formControlName="bloodGroup">
                @for (g of groups; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Units needed</mat-label>
              <input matInput type="number" min="1" max="20" formControlName="unitsNeeded" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Urgency</mat-label>
              <mat-select formControlName="urgency">
                <mat-option value="routine">Routine</mat-option>
                <mat-option value="urgent">Urgent</mat-option>
                <mat-option value="emergency">Emergency</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Needed by</mat-label>
              <input matInput [matDatepicker]="dp" formControlName="neededBy" />
              <mat-datepicker-toggle matIconSuffix [for]="dp" />
              <mat-datepicker #dp />
            </mat-form-field>

            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Patient name (optional)</mat-label>
              <input matInput formControlName="patientName" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Hospital name</mat-label>
              <input matInput formControlName="hospitalName" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Additional notes</mat-label>
              <textarea matInput rows="3" formControlName="notes"></textarea>
            </mat-form-field>

            <div class="md:col-span-2 flex justify-end gap-2 mt-2">
              <button mat-button type="button" (click)="form.reset({ urgency: 'urgent', unitsNeeded: 1 })">
                Reset
              </button>
              <button mat-flat-button color="warn" type="submit"
                      [disabled]="form.invalid || loading()">
                @if (loading()) { <mat-spinner diameter="20" /> } @else {
                  <ng-container><mat-icon>send</mat-icon> Broadcast request</ng-container>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RequestPage {
  private readonly fb       = inject(FormBuilder).nonNullable;
  private readonly reqSvc   = inject(BloodRequestService);
  private readonly locSvc   = inject(LocationService);
  private readonly auth     = inject(AuthStore);
  private readonly router   = inject(Router);
  private readonly snack    = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly groups  = ALL_BLOOD_GROUPS;

  readonly form = this.fb.group({
    bloodGroup:   [BloodGroup.O_POS, [Validators.required]],
    unitsNeeded:  [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    urgency:      ['urgent' as 'routine' | 'urgent' | 'emergency', [Validators.required]],
    neededBy:     [new Date(Date.now() + 24 * 3600 * 1000), [Validators.required]],
    patientName:  [''],
    hospitalName: ['', [Validators.required]],
    notes:        [''],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const v   = this.form.getRawValue();
    const loc = this.locSvc.current() ?? { lat: 19.076, lng: 72.8777 };
    const user = this.auth.user();

    this.reqSvc.create({
      requesterId:   user?.id ?? 'anon',
      requesterName: user?.fullName ?? 'Anonymous',
      patientName:   v.patientName || undefined,
      bloodGroup:    v.bloodGroup,
      unitsNeeded:   v.unitsNeeded,
      urgency:       v.urgency,
      hospitalName:  v.hospitalName,
      location:      { lat: loc.lat, lng: loc.lng },
      neededByIso:   new Date(v.neededBy).toISOString(),
      notes:         v.notes || undefined,
    }).subscribe({
      next: (req) => {
        this.loading.set(false);
        this.snack.open(
          v.urgency === 'emergency' ? '🚨 Emergency broadcast sent!' : 'Request created. Notifying donors…',
          'View',
          { duration: 5000 },
        );
        this.router.navigate(['/search'], { queryParams: { bg: v.bloodGroup, requestId: req.id } });
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Could not create request. Try again.', 'Dismiss', { duration: 4000 });
      },
    });
  }
}
