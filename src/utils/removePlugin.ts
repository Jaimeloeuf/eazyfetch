export function removePlugin(pluginList: Array<Function>): Function {
  return function (pluginName: string): void {
    const index = pluginList.findIndex((plugin) => plugin.name === pluginName);
    if (index !== -1) pluginList.splice(index, 1);
  };
}
