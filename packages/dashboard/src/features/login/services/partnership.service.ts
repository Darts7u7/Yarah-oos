export interface PartnershipConfig {
  partner_sites: string[];
}

/**
 * Partner sites for the cloud login flow.
 *
 * Yarah ships with no remote partner list: no network call is made and no
 * third-party sites are trusted. To white-label the login for partner sites
 * in the future, populate PARTNER_SITES or reintroduce a config fetch
 * against infrastructure you control.
 */
const PARTNER_SITES: string[] = [];

export class PartnershipService {
  private readonly config: PartnershipConfig = { partner_sites: PARTNER_SITES };

  fetchConfig(): Promise<PartnershipConfig | null> {
    return Promise.resolve(this.config);
  }

  /**
   * Kept for API compatibility with callers/tests; nothing is cached anymore.
   */
  clearCache(): void {}
}

export const partnershipService = new PartnershipService();
