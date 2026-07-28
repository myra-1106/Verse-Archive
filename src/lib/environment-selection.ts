export function legacyEnvironmentFlags(environmentNames: string[]) {
  return {
    supportsLab: environmentNames.includes("LAB"),
    supportsWcglass: environmentNames.includes("WCGlass"),
  };
}
