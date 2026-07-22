import { Injectable, inject } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import { environment } from '@env/environment';
import { API } from '../constants/api-endpoints';
import { AgentInput, AgentResponse, AgentStreamChunk, AvailabilityPrediction } from '../interfaces/ai-agent.interface';
import { RankedDonor } from '../models/donor.model';
import { DonorSearchQuery } from '../interfaces/donor-search.interface';
import { ApiService } from './api.service';
import { DonorService } from './donor.service';

/**
 * Frontend surface for the Python Agentic AI backend.
 * - `chat`  — non-streaming, useful for simple flows and tests.
 * - `chatStream` — SSE-style token stream via `fetch`+`ReadableStream`, so the
 *   AI chat page can render tokens as they arrive.
 * When `useMockApi` is on, we synthesize a canned agent that still calls the
 * real ranking utility, so the UX feels realistic before the backend exists.
 */
@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly api    = inject(ApiService);
  private readonly donors = inject(DonorService);

  chat(input: AgentInput): Observable<AgentResponse> {
    if (!environment.useMockApi) {
      return this.api.post<AgentResponse, AgentInput>(API.ai.chat, input);
    }
    return this.mockAgent(input);
  }

  chatStream(input: AgentInput): Observable<AgentStreamChunk> {
    if (environment.useMockApi) return this.mockStream(input);

    return new Observable<AgentStreamChunk>((sub) => {
      const controller = new AbortController();
      fetch(`${environment.apiBaseUrl}${API.ai.chat}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })
        .then(async (resp) => {
          if (!resp.body) throw new Error('No response body');
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload) continue;
              try { sub.next(JSON.parse(payload) as AgentStreamChunk); } catch { /* skip */ }
            }
          }
          sub.next({ delta: '', done: true });
          sub.complete();
        })
        .catch((err) => sub.error(err));
      return () => controller.abort();
    });
  }

  predictAvailability(donorId: string): Observable<AvailabilityPrediction> {
    if (!environment.useMockApi) {
      return this.api.post<AvailabilityPrediction, { donorId: string }>(API.ai.predict, { donorId });
    }
    return of({
      donorId,
      probability: 0.72,
      windowMinutes: 60,
      rationale: 'Historic response rate 90%, active in last 24h, within 5km.',
    });
  }

  rank(query: DonorSearchQuery): Observable<RankedDonor[]> {
    if (!environment.useMockApi) {
      return this.api.post<RankedDonor[], DonorSearchQuery>(API.ai.rank, query);
    }
    return this.donors.search(query);
  }

  // ---------------------------------------------------------------------------
  // Mock agent — narrow, deterministic, useful before the Python backend exists
  // ---------------------------------------------------------------------------

  private mockAgent(input: AgentInput): Observable<AgentResponse> {
    const text = input.message.toLowerCase();
    const isEmergency = /(urgent|emergency|asap|immediately|critical)/.test(text);
    const bg = text.match(/\b(a|b|ab|o)\s*[-+]?\b/i)?.[0]?.toUpperCase().replace(/\s+/g, '') ?? 'O+';

    return this.donors
      .search({
        bloodGroup: bg as never,
        origin: input.locationHint ?? { lat: 19.076, lng: 72.8777 },
        radiusKm: isEmergency ? 50 : 25,
        onlyEligible: true,
        onlyAvailable: true,
        limit: 5,
      })
      .pipe(
        map((ranked) => ({
          reply: isEmergency
            ? `Detected an emergency request for ${bg}. I found ${ranked.length} eligible donor(s) nearby, ranked by proximity and availability. Notifying the top matches now.`
            : `Here are the top ${ranked.length} donor(s) matching ${bg}, ranked by distance, eligibility and response rate.`,
          rankedDonors: ranked,
          isEmergency,
          explanation: ranked[0]
            ? `${ranked[0].donor.fullName} was selected first because: ${ranked[0].reasons.join('; ')}.`
            : 'No matching donors within radius.',
        })),
      );
  }

  private mockStream(input: AgentInput): Observable<AgentStreamChunk> {
    const text = input.message.toLowerCase();
    const isEmergency = /(urgent|emergency|asap|immediately|critical)/.test(text);
    const bgMatch     = text.match(/\b(a|b|ab|o)\s*[-+]?\b/i)?.[0]?.toUpperCase().replace(/\s+/g, '');
    const bg          = bgMatch ?? 'O+';

    return from(
      (async function* (): AsyncGenerator<AgentStreamChunk> {
        const opener = 'Analyzing your request… ';
        for (const ch of opener) { await new Promise((r) => setTimeout(r, 15)); yield { delta: ch }; }

        yield { toolCall: { name: 'search_donors', args: { bloodGroup: bg, radiusKm: isEmergency ? 50 : 25 } } };
        await new Promise((r) => setTimeout(r, 300));
        const foundCount = Math.floor(Math.random() * 5) + 1;
        yield { toolResult: { matches: foundCount } };

        const mid = isEmergency
          ? `\n🚨 Emergency detected. Broadening radius to 50km. `
          : `\nFound ${foundCount} candidates. `;
        for (const ch of mid) { await new Promise((r) => setTimeout(r, 15)); yield { delta: ch }; }

        yield { toolCall: { name: 'predict_availability', args: { topN: 3 } } };
        await new Promise((r) => setTimeout(r, 250));
        yield { toolResult: { avgProbability: 0.71 } };

        const tail = `Ranking by proximity, eligibility and response history.`;
        for (const ch of tail) { await new Promise((r) => setTimeout(r, 15)); yield { delta: ch }; }
        yield { delta: '', done: true };
      })(),
    );
  }
}
