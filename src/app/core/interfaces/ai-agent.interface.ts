import { RankedDonor } from '../models/donor.model';
import { BloodRequest } from '../models/blood-request.model';

/** Prompt an agent can process — free text plus structured hints. */
export interface AgentInput {
  message: string;
  contextRequestId?: string;
  locationHint?: { lat: number; lng: number };
}

/** Streaming token frame (SSE / chunked) coming back from the Python agent.
 *  Any single field is optional — a frame may carry just a delta, just a tool
 *  event, or just `done: true` at the end. */
export interface AgentStreamChunk {
  delta?: string;
  done?: boolean;
  toolCall?: { name: string; args: Record<string, unknown> };
  toolResult?: unknown;
}

/** Full non-streaming response, used for simpler flows. */
export interface AgentResponse {
  reply: string;
  matchedRequest?: BloodRequest;
  rankedDonors?: RankedDonor[];
  isEmergency?: boolean;
  explanation?: string;
}

/** Predicted probability that a donor will accept in the next N minutes. */
export interface AvailabilityPrediction {
  donorId: string;
  probability: number;             // 0..1
  windowMinutes: number;
  rationale: string;
}
