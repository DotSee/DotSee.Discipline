import type { VariantsHiderSettings } from './settings-fetcher.js';

/**
 * Service for hiding/showing unset language variants in the Umbraco content tree.
 * 
 * In multilingual Umbraco setups, when a content node doesn't have a variant created
 * for a specific language, it appears in the tree with its name in parentheses (e.g., "(Page Name)").
 * This service provides functionality to hide these placeholder nodes to reduce clutter.
 */
export class VariantsHiderService {
  private isHidden: boolean = false;
  private observer: MutationObserver | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private enabled: boolean = false;
  private caption: string = 'Toggle unset variants display';

  // Selectors for finding tree items in Umbraco v14+ backoffice
  // The backoffice uses web components, so we need to check various possible selectors
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
   * This is the preferred method as it avoids a duplicate API call.
   */
  initializeWithSettings(settings: VariantsHiderSettings): void {
    this.enabled = settings.enabled;
    this.caption = settings.caption;
    
    if (this.enabled) {
      this.setupMutationObserver();
      // Initially hide variants if enabled - delay slightly to allow tree to render
      setTimeout(() => {
        this.hideUnsetVariants();
        this.isHidden = true;
      }, 1000);
    }
    
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
        headers: {
          'Content-Type': 'application/json',
        },
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

  /**
   * Get the current caption for the toggle action.
   */
  getCaption(): string {
    return this.caption;
  }

  /**
   * Check if the service is enabled.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle the visibility of unset variants in the tree.
   * This will always work regardless of the 'enabled' configuration -
   * 'enabled' only controls whether auto-hide happens on load.
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
   * Hide all tree items that represent unset variants.
   * These are identified by having their name wrapped in parentheses.
   */
  private hideUnsetVariants(): void {
    const count = this.processTreeItems(true);
    this.applyHideStyles();
    console.log(`[DotSee.Discipline.VariantsHider] Processed ${count} items for hiding`);
  }

  /**
   * Show all previously hidden unset variant tree items.
   */
  private showUnsetVariants(): void {
    const count = this.processTreeItems(false);
    this.removeHideStyles();
    console.log(`[DotSee.Discipline.VariantsHider] Processed ${count} items for showing`);
  }

  /**
   * Process tree items to show or hide them based on whether they are unset variants.
   * @param hide Whether to hide (true) or show (false) the items
   * @returns The number of items processed
   */
  private processTreeItems(hide: boolean): number {
    let processedCount = 0;
    
    // First, try to find tree items using standard selectors
    const treeItems = document.querySelectorAll(this.TREE_ITEM_SELECTORS);
    console.log(`[DotSee.Discipline.VariantsHider] Found ${treeItems.length} tree items with standard selectors`);
    
    treeItems.forEach((item) => {
      if (this.processTreeItem(item as HTMLElement, hide)) {
        processedCount++;
      }
    });

    // Also search inside shadow DOMs of custom elements
    this.processShadowRoots(document.body, hide);
    
    // Debug: Log all elements in the tree area to help identify correct selectors
    this.debugLogTreeStructure();
    
    return processedCount;
  }
  
  /**
   * Debug helper to log the tree structure and help identify correct selectors
   */
  private debugLogTreeStructure(): void {
    console.log('[DotSee.Discipline.VariantsHider] === DEBUG: Scanning tree structure ===');
    
    // Look for the sidebar/tree container
    const possibleContainers = [
      'umb-backoffice-main',
      'umb-section-sidebar', 
      'umb-tree',
      'umb-document-tree',
      '[data-element="tree"]',
      'nav',
      'aside',
    ];
    
    possibleContainers.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`[DEBUG] Found ${elements.length} elements matching "${selector}"`);
      }
    });
    
    // Find any element containing text in parentheses
    const allElements = document.querySelectorAll('*');
    const elementsWithParentheses: {tag: string, text: string, classes: string}[] = [];
    
    allElements.forEach(el => {
      const text = el.textContent?.trim() || '';
      // Only check leaf-ish nodes (avoid containers that include all children text)
      if (el.children.length < 3 && text.startsWith('(') && text.endsWith(')') && text.length > 2 && text.length < 100) {
        elementsWithParentheses.push({
          tag: el.tagName.toLowerCase(),
          text: text.substring(0, 50),
          classes: el.className?.toString() || ''
        });
      }
    });
    
    if (elementsWithParentheses.length > 0) {
      console.log('[DEBUG] Elements with text in parentheses:', elementsWithParentheses);
    } else {
      console.log('[DEBUG] No elements found with text in parentheses');
    }
    
    // Log first few tree-like elements
    const treeElements = document.querySelectorAll('umb-tree-item, uui-menu-item, [role="treeitem"]');
    console.log(`[DEBUG] Found ${treeElements.length} tree-item-like elements`);
    if (treeElements.length > 0) {
      const sample = treeElements[0] as HTMLElement;
      console.log('[DEBUG] Sample tree item:', {
        tagName: sample.tagName,
        className: sample.className,
        attributes: Array.from(sample.attributes).map(a => `${a.name}="${a.value}"`).join(', '),
        innerHTML: sample.innerHTML.substring(0, 200)
      });
    }
  }

  /**
   * Recursively search through shadow DOMs to find tree items.
   */
  private processShadowRoots(root: Element | ShadowRoot, hide: boolean): void {
    const elements = root.querySelectorAll('*');
    elements.forEach((el) => {
      if (el.shadowRoot) {
        const shadowTreeItems = el.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS);
        shadowTreeItems.forEach((item) => {
          this.processTreeItem(item as HTMLElement, hide);
        });
        // Recurse into nested shadow roots
        this.processShadowRoots(el.shadowRoot, hide);
      }
    });
  }

  /**
   * Process a single tree item to determine if it should be hidden.
   * @param item The tree item element
   * @param hide Whether to hide (true) or show (false) the item
   * @returns True if the item was processed (matched criteria), false otherwise
   */
  private processTreeItem(item: HTMLElement, hide: boolean): boolean {
    // Get the text content - try multiple approaches
    const name = this.getTreeItemName(item);
    
    if (!name) {
      return false;
    }
    
    // Check if the name is wrapped in parentheses (indicates unset variant)
    if (this.isUnsetVariant(name)) {
      console.log(`[DotSee.Discipline.VariantsHider] Found unset variant: "${name}"`);
      
      if (hide) {
        item.classList.add('dotsee-variants-hidden');
        item.setAttribute('data-dotsee-hidden', 'true');
        item.style.display = 'none';
      } else {
        item.classList.remove('dotsee-variants-hidden');
        item.removeAttribute('data-dotsee-hidden');
        item.style.display = '';
      }
      return true;
    }
    
    return false;
  }

  /**
   * Extract the name/label from a tree item element.
   * Tries multiple strategies to find the text.
   */
  private getTreeItemName(item: HTMLElement): string {
    // Strategy 1: Check for label attribute
    const labelAttr = item.getAttribute('label') || item.getAttribute('name');
    if (labelAttr) {
      return labelAttr.trim();
    }

    // Strategy 2: Look for specific label elements/slots
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

    // Strategy 3: Check shadow DOM
    if (item.shadowRoot) {
      for (const selector of labelSelectors) {
        const labelEl = item.shadowRoot.querySelector(selector);
        if (labelEl?.textContent?.trim()) {
          return labelEl.textContent.trim();
        }
      }
      // Also try getting the first text node
      const textContent = item.shadowRoot.textContent?.trim();
      if (textContent) {
        return textContent;
      }
    }

    // Strategy 4: Direct text content as fallback (may include children)
    const directText = item.textContent?.trim();
    if (directText) {
      // Try to get just the first line or meaningful part
      const firstLine = directText.split('\n')[0]?.trim();
      return firstLine || directText;
    }

    return '';
  }

  /**
   * Check if a name represents an unset variant (wrapped in parentheses).
   * @param name The name to check
   * @returns True if the name represents an unset variant
   */
  private isUnsetVariant(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.startsWith('(') && trimmed.endsWith(')') && trimmed.length > 2;
  }

  /**
   * Apply CSS styles to hide the marked tree items.
   */
  private applyHideStyles(): void {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'dotsee-variants-hider-styles';
    this.styleElement.textContent = `
      .dotsee-variants-hidden,
      [data-dotsee-hidden="true"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  /**
   * Remove the CSS styles that hide tree items.
   */
  private removeHideStyles(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    
    // Also remove inline styles
    document.querySelectorAll('[data-dotsee-hidden]').forEach((el) => {
      (el as HTMLElement).style.display = '';
    });
  }

  /**
   * Set up a MutationObserver to watch for new tree items being added.
   * This ensures dynamically loaded tree items are also processed.
   */
  private setupMutationObserver(): void {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      if (!this.isHidden) return;

      let foundNewItems = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // Check if the added node is a tree item
            if (element.matches?.(this.TREE_ITEM_SELECTORS)) {
              this.processTreeItem(element, true);
              foundNewItems = true;
            }
            
            // Check for tree items within the added node
            const treeItems = element.querySelectorAll?.(this.TREE_ITEM_SELECTORS);
            if (treeItems?.length) {
              treeItems.forEach((item) => {
                this.processTreeItem(item as HTMLElement, true);
              });
              foundNewItems = true;
            }
          }
        });
      });

      if (foundNewItems) {
        console.log('[DotSee.Discipline.VariantsHider] Processed newly added tree items');
      }
    });

    // Start observing the document body for changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    console.log('[DotSee.Discipline.VariantsHider] MutationObserver started');
  }

  /**
   * Disconnect the MutationObserver and clean up.
   */
  dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.removeHideStyles();
  }
}
