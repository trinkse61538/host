import type { AirbnbPolicyStatus, ManagedApartment } from '../../domain/models';
import { AGENT_DIRECTORY, type AgentDirectoryEntry } from './agentDirectory';
import { normalizeSearch } from '../../shared/lib/text';

export function findAgentFallback(apartment: ManagedApartment): AgentDirectoryEntry | null {
  const name = normalizeSearch(apartment.apartment);
  const address = normalizeSearch(apartment.propertyAddress || apartment.keyAddress);
  return AGENT_DIRECTORY.find(entry => normalizeSearch(entry.address) === address
    || entry.apartmentNames.some(item => name.includes(normalizeSearch(item)) || normalizeSearch(item).includes(name))) || null;
}

export function policyStatus(apartment: ManagedApartment) {
  const fallback = findAgentFallback(apartment);
  const agent = apartment.airbnbAgentStatus !== 'unknown' ? apartment.airbnbAgentStatus : fallback?.agentStatus || 'unknown';
  const strata = apartment.airbnbStrataStatus !== 'unknown' ? apartment.airbnbStrataStatus : fallback?.strataStatus || 'unknown';
  const blocked = agent === 'not_allowed' || strata === 'not_allowed';
  return { agent, strata, blocked, fallback };
}

export function statusLabel(value: AirbnbPolicyStatus): string {
  return value === 'allowed' ? 'Allowed' : value === 'not_allowed' ? 'Not allowed' : value === 'review' ? 'Review' : 'Unknown';
}
