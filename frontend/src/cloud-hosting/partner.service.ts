/**
 * Partner origins for the cloud-hosting postMessage bridge.
 *
 * Yarah ships with no remote partner list: no network call is made and no
 * third-party origins are trusted. To white-label the dashboard for partner
 * sites in the future, populate PARTNER_ORIGINS with their origins (e.g.
 * 'https://partner.example.com') or reintroduce a config fetch against
 * infrastructure you control.
 */
const PARTNER_ORIGINS: string[] = [];

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export class PartnerService {
  private readonly partnerOrigins: Set<string>;

  constructor() {
    this.partnerOrigins = new Set(
      PARTNER_ORIGINS.flatMap((site) => {
        const normalized = normalizeOrigin(site);
        return normalized ? [normalized] : [];
      })
    );
  }

  fetchPartnerOrigins(): Promise<Set<string>> {
    return Promise.resolve(this.partnerOrigins);
  }
}

export const partnerService = new PartnerService();
