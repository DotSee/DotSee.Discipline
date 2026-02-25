import { UmbPropertyActionBase } from '@umbraco-cms/backoffice/property-action';
import { UMB_PROPERTY_CONTEXT, UMB_PROPERTY_DATASET_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbPropertyActionArgs } from '@umbraco-cms/backoffice/property-action';
import { navigatePrev, canGoPrev } from '../services/property-versions.service.js';
import { getCurrentStringValue, buildNewValue } from '../services/property-value-helpers.js';

export class PrevVersionAction extends UmbPropertyActionBase {
  #propertyContext?: any;
  #datasetContext?: any;
  #authContext?: any;
  #init: Promise<unknown>;

  constructor(host: UmbControllerHost, args: UmbPropertyActionArgs<never>) {
    super(host, args);
    this.#init = Promise.all([
      this.consumeContext(UMB_PROPERTY_CONTEXT, (ctx) => {
        this.#propertyContext = ctx;
      }).asPromise({ preventTimeout: true }),
      this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (ctx) => {
        this.#datasetContext = ctx;
      }).asPromise({ preventTimeout: true }),
      this.consumeContext(UMB_AUTH_CONTEXT, (ctx) => {
        this.#authContext = ctx;
      }).asPromise({ preventTimeout: true }),
    ]);

    // Once contexts are ready, notify elements to re-check disabled state
    this.#init.then(() => {
      document.dispatchEvent(new Event('dotsee-version-nav-changed'));
    });
  }

  /** Called by the element to check if this action should be disabled. */
  getDisabledState(): boolean {
    const contentKey = this.#datasetContext?.getUnique();
    const propertyAlias = this.#propertyContext?.getAlias();
    if (!contentKey || !propertyAlias) return false;
    const culture = this.#propertyContext?.getVariantId()?.culture ?? null;
    return !canGoPrev(contentKey, propertyAlias, culture);
  }

  override async execute(): Promise<void> {
    await this.#init;

    if (!this.#propertyContext || !this.#datasetContext || !this.#authContext) {
      return;
    }

    const contentKey = this.#datasetContext.getUnique();
    const propertyAlias = this.#propertyContext.getAlias();
    if (!contentKey || !propertyAlias) return;

    const variantId = this.#propertyContext.getVariantId();
    const culture = variantId?.culture ?? null;
    const rawValue = this.#propertyContext.getValue();
    const currentString = getCurrentStringValue(rawValue);
    const token = await this.#authContext.getLatestToken();

    const newString = await navigatePrev(contentKey, propertyAlias, culture, currentString, token);
    if (newString !== null) {
      this.#propertyContext.setValue(buildNewValue(rawValue, newString));
    }
  }
}

export { PrevVersionAction as api };
