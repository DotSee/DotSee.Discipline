import { VariantsHiderService } from './variants-hider.service.js';

// Singleton instance of the variants hider service
let variantsHiderService: VariantsHiderService | null = null;

/**
 * Initialize the variants hider service singleton.
 */
export function initializeVariantsHiderService(): VariantsHiderService {
  if (!variantsHiderService) {
    variantsHiderService = new VariantsHiderService();
  }
  return variantsHiderService;
}

/**
 * Get the variants hider service singleton instance.
 */
export function getVariantsHiderService(): VariantsHiderService | null {
  return variantsHiderService;
}
