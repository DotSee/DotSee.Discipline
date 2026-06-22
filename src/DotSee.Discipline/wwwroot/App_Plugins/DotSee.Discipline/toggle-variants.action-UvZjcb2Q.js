import { UmbEntityActionBase as e } from "@umbraco-cms/backoffice/entity-action";
import { g as s } from "./index-fVpIiBIX.js";
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
//# sourceMappingURL=toggle-variants.action-UvZjcb2Q.js.map
