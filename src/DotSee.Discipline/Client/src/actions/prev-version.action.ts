import { UmbPropertyActionBase } from '@umbraco-cms/backoffice/property-action';
import { UMB_PROPERTY_CONTEXT, UMB_PROPERTY_DATASET_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_BLOCK_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/block';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbPropertyActionArgs } from '@umbraco-cms/backoffice/property-action';
import { navigatePrev, canGoPrev } from '../services/property-versions.service.js';
import type { BlockParams } from '../services/property-versions.service.js';
import { getCurrentStringValue, buildNewValue } from '../services/property-value-helpers.js';

function getDocumentKeyFromUrl(): string | undefined {
  const match = window.location.pathname.match(/\/workspace\/document\/edit\/([a-f0-9-]+)/i);
  return match?.[1];
}

export class PrevVersionAction extends UmbPropertyActionBase {
  #propertyContext?: any;
  #datasetContext?: any;
  #authContext?: any;
  #blockParentAlias?: string;
  #init: Promise<unknown>;
  #blockInit: Promise<unknown>;

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

    // Block manager context is only available inside block editors.
    // We race with a short timer in execute() so non-block usage isn't delayed.
    this.#blockInit = this.consumeContext(UMB_BLOCK_MANAGER_CONTEXT, (ctx) => {
      this.observe(ctx.propertyAlias, (alias) => {
        this.#blockParentAlias = alias;
      });
    }).asPromise({ preventTimeout: true }).catch(() => {});

    // Once contexts are ready, notify elements to re-check disabled state
    this.#init.then(() => {
      document.dispatchEvent(new Event('dotsee-version-nav-changed'));
    });
  }

  #getBlockParams(): BlockParams | undefined {
    if (this.#blockParentAlias) {
      const blockElementKey = this.#datasetContext?.getUnique();
      if (blockElementKey) {
        return {
          parentPropertyAlias: this.#blockParentAlias,
          blockElementKey,
        };
      }
    }
    return undefined;
  }

  #getContentKey(block: BlockParams | undefined): string | undefined {
    if (block) {
      return getDocumentKeyFromUrl();
    }
    return this.#datasetContext?.getUnique();
  }

  /** Called by the element to check if this action should be disabled. */
  getDisabledState(): boolean {
    const block = this.#getBlockParams();
    const contentKey = this.#getContentKey(block);
    const propertyAlias = this.#propertyContext?.getAlias();
    if (!contentKey || !propertyAlias) return false;
    const culture = this.#propertyContext?.getVariantId()?.culture ?? null;
    return !canGoPrev(contentKey, propertyAlias, culture, block);
  }

  override async execute(): Promise<void> {
    await this.#init;
    // Wait up to 200ms for block context; resolves instantly if already available,
    // times out harmlessly when not inside a block.
    await Promise.race([this.#blockInit, new Promise((r) => setTimeout(r, 200))]);

    if (!this.#propertyContext || !this.#datasetContext || !this.#authContext) {
      return;
    }

    const block = this.#getBlockParams();
    const contentKey = this.#getContentKey(block);
    const propertyAlias = this.#propertyContext.getAlias();
    if (!contentKey || !propertyAlias) return;

    const variantId = this.#propertyContext.getVariantId();
    const culture = variantId?.culture ?? null;
    const rawValue = this.#propertyContext.getValue();
    const currentString = getCurrentStringValue(rawValue);
    const token = await this.#authContext.getLatestToken();

    const newString = await navigatePrev(contentKey, propertyAlias, culture, currentString, token, block);
    if (newString !== null) {
      this.#propertyContext.setValue(buildNewValue(rawValue, newString));
    }
  }
}

export { PrevVersionAction as api };
