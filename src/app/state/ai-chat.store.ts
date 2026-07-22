import { Injectable, computed, inject, signal } from '@angular/core';
import { ChatMessage } from '@core/models/chat-message.model';
import { AiService } from '@core/services/ai.service';

let idSeq = 0;
const nextId = () => `m-${Date.now()}-${++idSeq}`;

@Injectable({ providedIn: 'root' })
export class AiChatStore {
  private readonly ai = inject(AiService);

  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _sending  = signal(false);

  readonly messages = this._messages.asReadonly();
  readonly sending  = this._sending.asReadonly();
  readonly isEmpty  = computed(() => this._messages().length === 0);

  send(text: string, locationHint?: { lat: number; lng: number }): void {
    const trimmed = text.trim();
    if (!trimmed || this._sending()) return;

    const userMsg: ChatMessage = {
      id: nextId(), role: 'user', content: trimmed, createdAt: new Date().toISOString(),
    };
    const draft: ChatMessage = {
      id: nextId(), role: 'assistant', content: '', createdAt: new Date().toISOString(), streaming: true,
    };
    this._messages.update((m) => [...m, userMsg, draft]);
    this._sending.set(true);

    this.ai.chatStream({ message: trimmed, locationHint }).subscribe({
      next: (chunk) => {
        if (chunk.done) return;
        this._messages.update((list) =>
          list.map((m) => {
            if (m.id !== draft.id) return m;
            let next = { ...m, content: m.content + (chunk.delta ?? '') };
            if (chunk.toolCall) {
              const events = [...(next.toolEvents ?? []), { name: chunk.toolCall.name, args: chunk.toolCall.args }];
              next = { ...next, toolEvents: events };
            }
            if (chunk.toolResult !== undefined) {
              const events = [...(next.toolEvents ?? [])];
              const last = events[events.length - 1];
              if (last && last.result === undefined) events[events.length - 1] = { ...last, result: chunk.toolResult };
              next = { ...next, toolEvents: events };
            }
            return next;
          }),
        );
      },
      error: (err) => {
        this._messages.update((list) =>
          list.map((m) => (m.id === draft.id ? { ...m, streaming: false, error: String(err) } : m)),
        );
        this._sending.set(false);
      },
      complete: () => {
        this._messages.update((list) =>
          list.map((m) => (m.id === draft.id ? { ...m, streaming: false } : m)),
        );
        this._sending.set(false);
      },
    });
  }

  clear(): void { this._messages.set([]); }
}
