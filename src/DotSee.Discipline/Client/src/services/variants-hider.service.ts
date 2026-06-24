import type { VariantsHiderSettings } from './settings-fetcher.js';

/**
 * Service for hiding/showing unset language variants in the Umbraco content tree.
 *
 * In multilingual Umbraco setups, when a content node doesn't have a variant created
 * for a specific language, it appears in the tree with its name in parentheses (e.g., "(Page Name)").
 * This service provides functionality to hide these placeholder nodes to reduce clutter.
 *
 * Uses a MutationObserver (over the light DOM and any open shadow roots) to detect
 * tree changes and re-scan only when something actually changes, coalescing bursts
 * to at most one scan per animation frame — instead of scanning the whole document
 * and shadow-DOM tree on every frame. The coalescing frame still runs before paint,
 * so newly rendered items are hidden without a visible flash.
 */
export class VariantsHiderService {
  private isHidden: boolean = false;
  private enabled: boolean = false;
  private caption: string = 'Toggle unset variants display';

  // Mutation-driven scanning state.
  private observing: boolean = false;
  private observers: Set<MutationObserver> = new Set();
  private observedRoots: WeakSet<ShadowRoot> = new WeakSet();
  private scanRafId: number | null = null;

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
    } catch {
      // Settings fetch failed — service remains disabled with defaults.
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
    if (this.isHidden) {
      this.showUnsetVariants();
      this.isHidden = false;
    } else {
      this.hideUnsetVariants();
      this.isHidden = true;
    }
  }

  /**
   * Hide all unset variants and start observing the tree for changes. The initial
   * pass also attaches observers to any open shadow roots it walks through.
   */
  private hideUnsetVariants(): void {
    this.observing = true;
    this.processTreeItems(true);
    this.observeRoot(document.body ?? document.documentElement);
  }

  /**
   * Stop observing, show all hidden variants, and reset state.
   */
  private showUnsetVariants(): void {
    this.stopObserving();
    this.processTreeItems(false);
  }

  // ---------------------------------------------------------------------------
  // Mutation-driven scanning
  // ---------------------------------------------------------------------------

  /**
   * Attach a MutationObserver to a light-DOM root or shadow root, once. Mutations
   * trigger a coalesced rescan rather than a continuous per-frame loop.
   */
  private observeRoot(root: Node): void {
    const observer = new MutationObserver(() => this.scheduleScan());
    observer.observe(root, {
      childList: true,
      subtree: true,
      // getTreeItemName() reads the label/name attributes and text content, which can change
      // in place (e.g. a language variant being created flips "(Name)" to "Name"). Watch those
      // so a rename triggers a rescan. The attribute filter keeps us off unrelated attribute
      // churn and avoids re-triggering on our own style / data-dotsee-hidden writes.
      attributeFilter: ['label', 'name'],
      characterData: true,
    });
    this.observers.add(observer);
  }

  /**
   * Queue a single scan for the next animation frame. Repeated mutations within the
   * same frame collapse into one scan, and the frame runs before paint (no flash).
   */
  private scheduleScan(): void {
    if (this.scanRafId !== null) return;
    this.scanRafId = requestAnimationFrame(() => {
      this.scanRafId = null;
      if (this.observing) {
        this.processTreeItems(true);
      }
    });
  }

  private stopObserving(): void {
    this.observing = false;
    if (this.scanRafId !== null) {
      cancelAnimationFrame(this.scanRafId);
      this.scanRafId = null;
    }
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.observedRoots = new WeakSet();
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
        // While observing, watch each open shadow root so changes inside it (which
        // don't bubble to the host's observer) also trigger a rescan.
        if (this.observing && !this.observedRoots.has(el.shadowRoot)) {
          this.observedRoots.add(el.shadowRoot);
          this.observeRoot(el.shadowRoot);
        }
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
    // Restore anything we hid (remove display:none and data-dotsee-hidden) before tearing down,
    // so disposing while in "hidden" mode doesn't leave the tree permanently modified.
    if (this.isHidden) {
      this.processTreeItems(false);
      this.isHidden = false;
    }
    this.stopObserving();
  }
}
