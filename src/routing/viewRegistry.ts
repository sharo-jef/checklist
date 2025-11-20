import { ViewRegistry } from "@/types/routing";
import { DefaultView } from "@/components/DefaultView";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";

/**
 * Component registry for view routing.
 * Maps ViewKey strings to React components.
 */
export const VIEW_COMPONENTS: ViewRegistry = {
  default: DefaultView,
  "menu-normal": ChecklistMenu,
  "menu-non-normal": ChecklistMenu,
  "menu-resets": ResetsMenu,
  "checklist-normal": ChecklistDisplay,
  "checklist-non-normal": ChecklistDisplay,
};
