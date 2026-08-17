/**
 * Realtime feature types - Backend-only types
 *
 * Shared types should be imported directly from @yarahdev/shared-schemas.
 */

// ============================================================================
// Backend-Only Types (Internal Use)
// ============================================================================

/**
 * Delivery statistics after message processing
 */
export interface DeliveryResult {
  wsAudienceCount: number;
  whAudienceCount: number;
  whDeliveredCount: number;
}
