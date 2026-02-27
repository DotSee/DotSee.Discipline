import { UmbEntityActionBase as t } from "@umbraco-cms/backoffice/entity-action";
import { g as s } from "./index-CbnpoTq6.js";
class o extends t {
  constructor(i, e) {
    super(i, e);
  }
  async execute() {
    const i = s();
    i ? i.toggleVariantsVisibility() : console.warn("[DotSee.Discipline.VariantsHider] Service not initialized");
  }
}
export {
  o as ToggleVariantsAction,
  o as api
};
//# sourceMappingURL=toggle-variants.action-Bf7Fvx01.js.map
