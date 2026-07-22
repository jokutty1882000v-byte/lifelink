import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { User, UserRole } from '@core/models/user.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'll-admin-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Users</h1>

      <mat-card class="!rounded-2xl mb-4">
        <mat-card-content class="!p-4 flex flex-wrap gap-3 items-center">
          <mat-form-field appearance="outline" class="!w-64">
            <mat-label>Search name or email</mat-label>
            <input matInput [(ngModel)]="query" (ngModelChange)="onFilter()" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="!w-48">
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="roleFilter" (selectionChange)="onFilter()">
              <mat-option [value]="null">All roles</mat-option>
              <mat-option value="donor">Donor</mat-option>
              <mat-option value="requester">Requester</mat-option>
              <mat-option value="hospital_staff">Hospital staff</mat-option>
              <mat-option value="admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="ml-auto text-sm text-gray-500">{{ filtered().length }} of {{ items().length }} users</div>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <ll-loading-spinner label="Loading users…" />
      } @else {
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-0 overflow-x-auto">
            <table mat-table [dataSource]="filtered()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let u">{{ u.fullName }}</td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let u">{{ u.email }}</td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let u">
                  <span class="text-xs px-2 py-0.5 rounded-full" [class]="roleClass(u.role)">{{ u.role }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="bloodGroup">
                <th mat-header-cell *matHeaderCellDef>Group</th>
                <td mat-cell *matCellDef="let u">{{ u.bloodGroup ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="verified">
                <th mat-header-cell *matHeaderCellDef>Verified</th>
                <td mat-cell *matCellDef="let u">
                  <mat-icon [class]="u.isVerified ? 'text-emerald-600' : 'text-gray-400'">
                    {{ u.isVerified ? 'verified' : 'pending' }}
                  </mat-icon>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
                <td mat-cell *matCellDef="let u" class="text-right">
                  <button mat-icon-button (click)="toggleVerified(u)" [attr.aria-label]="u.isVerified ? 'Unverify' : 'Verify'">
                    <mat-icon>{{ u.isVerified ? 'block' : 'verified' }}</mat-icon>
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
export class AdminUsersPage implements OnInit {
  private readonly http = inject(HttpClient);
  readonly columns = ['name', 'email', 'role', 'bloodGroup', 'verified', 'actions'];
  readonly items    = signal<User[]>([]);
  readonly loading  = signal(true);
  private readonly querySignal      = signal('');
  private readonly roleFilterSignal = signal<UserRole | null>(null);

  query = '';
  roleFilter: UserRole | null = null;

  readonly filtered = computed(() => {
    const q = this.querySignal().toLowerCase().trim();
    const r = this.roleFilterSignal();
    return this.items().filter((u) => {
      if (r && u.role !== r) return false;
      if (q && !`${u.fullName} ${u.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.http.get<User[]>('assets/mock/users.json').subscribe((list) => {
      this.items.set(list); this.loading.set(false);
    });
  }

  onFilter(): void {
    this.querySignal.set(this.query);
    this.roleFilterSignal.set(this.roleFilter);
  }

  toggleVerified(u: User): void {
    this.items.update((list) => list.map((x) => x.id === u.id ? { ...x, isVerified: !x.isVerified } : x));
  }

  roleClass(r: UserRole): string {
    const map: Record<UserRole, string> = {
      admin:          'bg-blood-100 text-blood-800',
      hospital_staff: 'bg-blue-100 text-blue-800',
      donor:          'bg-emerald-100 text-emerald-800',
      requester:      'bg-amber-100 text-amber-800',
    };
    return map[r];
  }
}
