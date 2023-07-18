export type AppVersionType = {
  major: number,
  minor: number,
  patch: number,
};

const appVersionStringComponents = APP_VERSION.split('.');

export const AppVersion: AppVersionType = {
  major: Number(appVersionStringComponents[0]),
  minor: Number(appVersionStringComponents[1]),
  patch: Number(appVersionStringComponents[2]),
};

export default AppVersion;
