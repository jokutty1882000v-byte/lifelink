import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BloodRequest, RequestStatus, RequestUrgency } from '@core/models/blood-request.model';
import { BloodRequestService } from '@core/services/blood-request.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';

@Component({
  selector: 'll-admin-requests',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule,
    EmptyStateComponent, TimeAgoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Requests</h1>

      <mat-card class="!rounded-2xl mb-4">
        <mat-card-content class="!p-4 flex flex-wrap gap-3 items-center">
          <mat-form-field appearance="outline" class="!w-40">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="onFilter()">
              <mat-option [value]="null">All</mat-option>
              <mat-option value="open">Open</mat-option>
              <mat-option value="matched">Matched</mat-option>
              <mat-option value="fulfilled">Fulfilled</mat-option>
              <mat-option value="cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="!w-40">
            <mat-label>Urgency</mat-label>
            <mat-select [(ngModel)]="urgencyFilter" (selectionChange)="onFilter()">
              <mat-option [value]="null">All</mat-option>
              <mat-option value="routine">Routine</mat-option>
              <mat-option value="urgent">Urgent</mat-option>
              <mat-option value="emergency">Emergency</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="ml-auto text-sm text-gray-500">{{ filtered().length }} requests</div>
        </mat-card-content>
      </mat-card>

      @if (filtered().length === 0) {
        <ll-empty-state icon="bloodtype" title="No requests match"
          message="Create a request from the main app or clear filters." />
      } @else {
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-0 overflow-x-auto">
            <table mat-table [dataSource]="filtered()" class="w-full">
              <ng-container matColumnDef="requester">
                <th mat-header-cell *matHeaderCellDef>Requester</th>
                <td mat-cell *matCellDef="let r">{{ r.requesterName }}</td>
              </ng-container>
              <ng-container matColumnDef="group">
                <th mat-header-cell *matHeaderCellDef>Group</th>
                <td mat-cell *matCellDef="let r"><span class="font-semibold text-blood-700">{{ r.bloodGroup }}</span></td>
              </ng-container>
              <ng-container matColumnDef="units">
                <th mat-header-cell *matHeaderCellDef>Units</th>
                <td mat-cell *matCellDef="let r">{{ r.unitsNeeded }}</td>
              </ng-container>
              <ng-container matColumnDef="urgency">
                <th mat-header-cell *matHeaderCellDef>Urgency</th>
                <td mat-cell *matCellDef="let r">
                  <span class="text-xs px-2 py-0.5 rounded-full" [class]="urgencyClass(r.urgency)">{{ r.urgency }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800">{{ r.status }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let r" class="text-xs text-gray-500">{{ r.createdAt | timeAgo }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
                <td mat-cell *matCellDef="let r" class="text-right">
                  <button mat-icon-button (click)="fulfill(r)" [disabled]="r.status === 'fulfilled'" aria-label="Force match">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button (click)="cancel(r)" [disabled]="r.status === 'cancelled'" aria-label="Cancel">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class AdminRequestsPage implements OnInit {
  private readonly svc   = inject(BloodRequestService);
  private readonly snack = inject(MatSnackBar);

  readonly columns = ['requester', 'group', 'units', 'urgency', 'status', 'created', 'actions'];
  readonly items = signal<BloodRequest[]>([]);
  private readonly statusSignal  = signal<RequestStatus | null>(null);
  private readonly urgencySignal = signal<RequestUrgency | null>(null);

  statusFilter:  RequestStatus  | null = null;
  urgencyFilter: RequestUrgency | null = null;

  readonly filtered = computed(() => {
    const s = this.statusSignal(); const u = this.urgencySignal();
    return this.items().filter((r) =>
      (!s || r.status === s) && (!u || r.urgency === u),
    );
  });

  ngOnInit(): void { this.svc.list().subscribe((list) => this.items.set(list)); }

  onFilter(): void {
    this.statusSignal.set(this.statusFilter);
    this.urgencySignal.set(this.urgencyFilter);
  }

  fulfill(r: BloodRequest): void {
    this.svc.fulfill(r.id).subscribe(() => {
      this.svc.list().subscribe((list) => this.items.set(list));
      this.snack.open(`Request ${r.id} marked fulfilled.`, 'Dismiss', { duration: 3000 });
    });
  }

  cancel(r: BloodRequest): void {
    this.svc.cancel(r.id).subscribe(() => {
      this.svc.list().subscribe((list) => this.items.set(list));
      this.snack.open(`Request ${r.id} cancelled.`, 'Dismiss', { duration: 3000 });
    });
  }

  urgencyClass(u: RequestUrgency): string {
    const map: Record<RequestUrgency, string> = {
      routine:   'bg-blue-100 text-blue-800',
      urgent:    'bg-amber-100 text-amber-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return map[u];
  }
}
