import { UmbEntityActionBase as e } from "@umbraco-cms/backoffice/entity-action";
import { g as s } from "./index-BuIMco7X.js";
class c extends e {
  constructor(t, i) {
    super(t, i);
  }
  async execute() {
    const t = s();
    t && t.toggleVariantsVisibility();
  }
}
export {
  c as ToggleVariantsAction,
  c as api
};
//# sourceMappingURL=toggle-variants.action-D6o88Oe8.js.map
