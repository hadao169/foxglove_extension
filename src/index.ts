import { ExtensionContext } from "@foxglove/extension";
import { initRobotPanel } from "./PanelSetting";
import { initExamplePanel } from "./PanelSettingExample";
import { initExamplePanel as initExamplePanel2 } from "./Example";

export function activate(extensionContext: ExtensionContext) {
  extensionContext.registerPanel({
    name: "Robot Control Panel",
    initPanel: initRobotPanel,
  });
  extensionContext.registerPanel({
    name: "Panel Setting Example",
    initPanel: initExamplePanel,
  }); 

  extensionContext.registerPanel({
    name: "Example Panel",
    initPanel: initExamplePanel2,
  });
}