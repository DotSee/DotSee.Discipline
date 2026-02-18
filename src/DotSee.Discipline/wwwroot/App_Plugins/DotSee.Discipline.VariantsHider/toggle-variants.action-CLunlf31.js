import { UmbEntityActionBase as t } from "@umbraco-cms/backoffice/entity-action";
import { getVariantsHiderService as r } from "./dotsee-discipline-variantshider.js";
class a extends t {
  constructor(i, e) {
    super(i, e);
  }
  async execute() {
    const i = r();
    i ? i.toggleVariantsVisibility() : console.warn("[DotSee.Discipline.VariantsHider] Service not initialized");
  }
}
export {
  a as ToggleVariantsAction,
  a as api
};
//# sourceMappingURL=toggle-variants.action-CLunlf31.js.map
