import { UAParser } from "ua-parser-js";

export const getDeviceInfoFromUserAgent = (type, ip, userAgent) => {
  const parser = new UAParser(userAgent);

  return {
    type,
    ip,
    os: parser.getOS().name,
    osVersion: parser.getOS().version,
    browser: parser.getBrowser().name,
    browserVersion: parser.getBrowser().version,
  };
};
