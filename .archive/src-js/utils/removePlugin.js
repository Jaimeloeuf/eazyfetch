export function removePlugin(pluginList) {
  return function (pluginName) {
    const index = pluginList.findIndex((plugin) => plugin.name === pluginName);
    if (index !== -1) pluginList.splice(index, 1);
  };
}
