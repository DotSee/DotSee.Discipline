import type { VariantsHiderSettings } from './settings-fetcher.js';

/**
 * Service for hiding/showing unset language variants in the Umbraco content tree.
 *
 * In multilingual Umbraco setups, when a content node doesn't have a variant created
 * for a specific language, it appears in the tree with its name in parentheses (e.g., "(Page Name)").
 * This service provides functionality to hide these placeholder nodes to reduce clutter.
 *
 * Uses requestAnimationFrame to scan for new items before the browser paints,
 * ensuring no visible flash when tree nodes are expanded.
 */
export class VariantsHiderService {
  private isHidden: boolean = false;
  private rafId: number | null = null;
  private enabled: boolean = false;
  private caption: string = 'Toggle unset variants display';

  // Selectors for finding tree items in Umbraco v14+ backoffice
  private readonly TREE_ITEM_SELECTORS = [
    'umb-tree-item',
    'uui-menu-item',
    '[data-element="tree-item"]',
    '[role="treeitem"]',
    '.umb-tree-item',
    'umb-document-tree-item',
  ].join(', ');

  /**
   * Initialize the service with pre-fetched settings.
   */
  initializeWithSettings(settings: VariantsHiderSettings): void {
    this.enabled = settings.enabled;
    this.caption = settings.caption;
    console.log(`[DotSee.Discipline.VariantsHider] Initialized with Enabled: ${this.enabled}, Caption: ${this.caption}`);
  }

  /**
   * @deprecated Use initializeWithSettings instead to avoid duplicate API calls
   */
  async initialize(): Promise<void> {
    try {
      const response = await fetch('/umbraco/api/variantshider/settings', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const settings = await response.json();
        this.initializeWithSettings({
          enabled: settings.enabled === true || settings.enabled === 'true',
          caption: settings.caption || this.caption,
        });
      }
    } catch (error) {
      console.error('[DotSee.Discipline.VariantsHider] Failed to fetch settings:', error);
    }
  }

  getCaption(): string {
    return this.caption;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle the visibility of unset variants in the tree.
   */
  toggleVariantsVisibility(): void {
    console.log('[DotSee.Discipline.VariantsHider] Toggle called, current state:', this.isHidden ? 'hidden' : 'visible');

    if (this.isHidden) {
      this.showUnsetVariants();
      this.isHidden = false;
      console.log('[DotSee.Discipline.VariantsHider] Variants are now VISIBLE');
    } else {
      this.hideUnsetVariants();
      this.isHidden = true;
      console.log('[DotSee.Discipline.VariantsHider] Variants are now HIDDEN');
    }
  }

  /**
   * Hide all unset variants and start a requestAnimationFrame loop that
   * continuously scans for newly rendered items. RAF callbacks run before
   * the browser paints, so new items are hidden before they appear on screen.
   */
  private hideUnsetVariants(): void {
    const count = this.processTreeItems(true);
    this.startRafScan();
    console.log(`[DotSee.Discipline.VariantsHider] Processed ${count} items for hiding`);
  }

  /**
   * Stop scanning, show all hidden variants, and reset state.
   */
  private showUnsetVariants(): void {
    this.stopRafScan();
    const count = this.processTreeItems(false);
    console.log(`[DotSee.Discipline.VariantsHider] Processed ${count} items for showing`);
  }

  // ---------------------------------------------------------------------------
  // requestAnimationFrame scan loop
  // ---------------------------------------------------------------------------

  private startRafScan(): void {
    if (this.rafId !== null) return;
    const scan = () => {
      this.processTreeItems(true);
      this.rafId = requestAnimationFrame(scan);
    };
    this.rafId = requestAnimationFrame(scan);
  }

  private stopRafScan(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Tree item processing
  // ---------------------------------------------------------------------------

  private processTreeItems(hide: boolean): number {
    let processedCount = 0;

    const treeItems = document.querySelectorAll(this.TREE_ITEM_SELECTORS);
    treeItems.forEach((item) => {
      if (this.processTreeItem(item as HTMLElement, hide)) {
        processedCount++;
      }
    });

    processedCount += this.processShadowRoots(document.body, hide);
    return processedCount;
  }

  private processShadowRoots(root: Element | ShadowRoot, hide: boolean): number {
    let count = 0;
    const elements = root.querySelectorAll('*');
    elements.forEach((el) => {
      if (el.shadowRoot) {
        const shadowTreeItems = el.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS);
        shadowTreeItems.forEach((item) => {
          if (this.processTreeItem(item as HTMLElement, hide)) {
            count++;
          }
        });
        count += this.processShadowRoots(el.shadowRoot, hide);
      }
    });
    return count;
  }

  private processTreeItem(item: HTMLElement, hide: boolean): boolean {
    const wasHiddenByUs = item.hasAttribute('data-dotsee-hidden');

    if (!hide) {
      if (wasHiddenByUs) {
        item.style.display = '';
        item.removeAttribute('data-dotsee-hidden');
        return true;
      }
      return false;
    }

    // hide === true
    const name = this.getTreeItemName(item);
    if (!name) return false;

    if (this.isUnsetVariant(name)) {
      if (!wasHiddenByUs) {
        item.style.display = 'none';
        item.setAttribute('data-dotsee-hidden', '');
        return true;
      }
      // Already hidden, still a variant — keep hidden
    } else if (wasHiddenByUs) {
      // Was hidden by us but name changed (e.g. language switch) — restore
      item.style.display = '';
      item.removeAttribute('data-dotsee-hidden');
    }

    return false;
  }

  private getTreeItemName(item: HTMLElement): string {
    const labelAttr = item.getAttribute('label') || item.getAttribute('name');
    if (labelAttr) return labelAttr.trim();

    const labelSelectors = [
      '[slot="label"]',
      '.umb-tree-item__label',
      '.uui-menu-item-label',
      'uui-menu-item-label',
      '[part="label"]',
      'span[slot]',
      'a',
      'button span',
      'span:not([slot="icon"])',
    ];

    for (const selector of labelSelectors) {
      const labelEl = item.querySelector(selector);
      if (labelEl?.textContent?.trim()) {
        return labelEl.textContent.trim();
      }
    }

    if (item.shadowRoot) {
      for (const selector of labelSelectors) {
        const labelEl = item.shadowRoot.querySelector(selector);
        if (labelEl?.textContent?.trim()) {
          return labelEl.textContent.trim();
        }
      }
      const textContent = item.shadowRoot.textContent?.trim();
      if (textContent) return textContent;
    }

    const directText = item.textContent?.trim();
    if (directText) {
      const firstLine = directText.split('\n')[0]?.trim();
      return firstLine || directText;
    }

    return '';
  }

  private isUnsetVariant(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.startsWith('(') && trimmed.endsWith(')') && trimmed.length > 2;
  }

  dispose(): void {
    this.stopRafScan();
  }
}
