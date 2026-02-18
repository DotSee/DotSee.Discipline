import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';
import type { UmbEntityActionArgs } from '@umbraco-cms/backoffice/entity-action';
import type { UmbControllerHostElement } from '@umbraco-cms/backoffice/controller-api';
import { getVariantsHiderService } from '../services/service-instance.js';

/**
 * Entity action for toggling the visibility of unset language variants in the content tree.
 * When executed, it toggles the display of tree items whose names are enclosed in parentheses,
 * which indicates they are placeholders for not-yet-created language variants.
 */
export class ToggleVariantsAction extends UmbEntityActionBase<never> {
  
  constructor(host: UmbControllerHostElement, args: UmbEntityActionArgs<never>) {
    super(host, args);
  }

  override async execute(): Promise<void> {
    const service = getVariantsHiderService();
    if (service) {
      service.toggleVariantsVisibility();
    } else {
      console.warn('[DotSee.Discipline.VariantsHider] Service not initialized');
    }
  }
}

export { ToggleVariantsAction as api };
