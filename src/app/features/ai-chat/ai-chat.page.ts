import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AiService } from '@core/services/ai.service';
import { LocationService } from '@core/services/location.service';
import { AgentResponse } from '@core/interfaces/ai-agent.interface';
import { AiChatStore } from '@state/ai-chat.store';
import { AutofocusDirective } from '@shared/directives/autofocus.directive';
import { DonorCardComponent } from '@shared/components/donor-card/donor-card.component';

@Component({
  selector: 'll-ai-chat-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatChipsModule,
    AutofocusDirective, DonorCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <header class="mb-3">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <mat-icon class="text-blood-600">smart_toy</mat-icon> AI Assistant
        </h1>
        <p class="text-sm text-gray-500">Describe what you need — I'll find donors, hospitals, or answer questions.</p>
      </header>

      <div #scroll class="flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-neutral-950 border dark:border-neutral-800 p-4 space-y-3">
        @if (store.isEmpty() && !lastResponse()) {
          <div class="text-center text-sm text-gray-500 mt-10 space-y-3">
            <p>Try one of these:</p>
            <div class="flex flex-wrap gap-2 justify-center">
              @for (s of suggestions; track s) {
                <button mat-stroked-button (click)="quickSend(s)">{{ s }}</button>
              }
            </div>
          </div>
        }

        @for (m of store.messages(); track m.id) {
          <div [class]="m.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="bubble(m.role)">
              @if (m.content) { {{ m.content }} }
              @if (m.streaming) { <span class="animate-pulse">▊</span> }
              @if (m.error) { <span class="text-red-400 text-xs block mt-1">{{ m.error }}</span> }
            </div>
          </div>
        }

        @if (lastResponse(); as resp) {
          @if (resp.isEmergency) {
            <div class="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 flex items-start gap-2">
              <mat-icon class="text-red-700">emergency</mat-icon>
              <div>
                <div class="font-semibold text-red-800 dark:text-red-200">Emergency detected</div>
                <div class="text-sm text-red-700 dark:text-red-300">
                  Top-ranked donors below have been notified.
                </div>
              </div>
            </div>
          }
          @if (resp.rankedDonors?.length) {
            <div class="grid gap-2">
              @for (r of resp.rankedDonors; track r.donor.id) {
                <ll-donor-card [ranked]="r" />
              }
            </div>
          }
          @if (resp.explanation) {
            <div class="text-xs text-gray-500 italic p-2 border-l-2 border-blood-600">
              {{ resp.explanation }}
            </div>
          }
        }
      </div>

      <form class="mt-3 flex gap-2" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="flex-1">
          <mat-label>Type a message…</mat-label>
          <input matInput llAutofocus [(ngModel)]="draft" name="draft" [disabled]="store.sending()" />
        </mat-form-field>
        <button mat-flat-button color="warn" type="submit" [disabled]="!draft.trim() || store.sending()">
          <mat-icon>send</mat-icon>
        </button>
      </form>
    </div>
  `,
})
export class AiChatPage {
  readonly store        = inject(AiChatStore);
  private readonly ai   = inject(AiService);
  private readonly loc  = inject(LocationService);
  @ViewChild('scroll') private readonly scroll?: ElementRef<HTMLElement>;

  draft = '';
  readonly lastResponse = signal<AgentResponse | null>(null);
  readonly suggestions = [
    'Find O- donors within 10km, urgent',
    'Show nearby blood banks with A+ stock',
    'Am I eligible to donate again?',
  ];

  quickSend(text: string): void { this.draft = text; this.submit(); }

  submit(): void {
    const text = this.draft.trim();
    if (!text) return;
    this.draft = '';

    const locHint = this.loc.current();
    this.store.send(text, locHint ? { lat: locHint.lat, lng: locHint.lng } : undefined);

    // In parallel, fetch the structured response for the ranked donor cards.
    this.ai.chat({
      message: text,
      locationHint: locHint ? { lat: locHint.lat, lng: locHint.lng } : undefined,
    }).subscribe((resp) => this.lastResponse.set(resp));

    queueMicrotask(() => {
      if (this.scroll) this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
    });
  }

  bubble(role: string): string {
    const base = 'max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap';
    return role === 'user'
      ? `${base} bg-blood-600 text-white`
      : `${base} bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-100`;
  }
}
