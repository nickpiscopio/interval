const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

export const encodeBase64 = (str: string): string => {
  // UTF-8 support
  const utf8Str = unescape(encodeURIComponent(str));
  let result = "";
  let i = 0;
  while (i < utf8Str.length) {
    const c1 = utf8Str.charCodeAt(i++);
    const c2 = i < utf8Str.length ? utf8Str.charCodeAt(i++) : NaN;
    const c3 = i < utf8Str.length ? utf8Str.charCodeAt(i++) : NaN;

    const byte1 = c1 >> 2;
    const byte2 = ((c1 & 3) << 4) | (isNaN(c2) ? 0 : c2 >> 4);
    const byte3 = isNaN(c2) ? 64 : ((c2 & 15) << 2) | (isNaN(c3) ? 0 : c3 >> 6);
    const byte4 = isNaN(c3) ? 64 : c3 & 63;

    result += chars.charAt(byte1) + chars.charAt(byte2) + chars.charAt(byte3) + chars.charAt(byte4);
  }
  return result;
};

export const decodeBase64 = (str: string): string => {
  let result = "";
  let i = 0;
  // Remove non-base64 characters
  const cleanStr = str.replace(/[^A-Za-z0-9+/=]/g, "");
  while (i < cleanStr.length) {
    const enc1 = chars.indexOf(cleanStr.charAt(i++) || "=");
    const enc2 = chars.indexOf(cleanStr.charAt(i++) || "=");
    const enc3 = chars.indexOf(cleanStr.charAt(i++) || "=");
    const enc4 = chars.indexOf(cleanStr.charAt(i++) || "=");

    const byte1 = (enc1 << 2) | (enc2 >> 4);
    const byte2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const byte3 = ((enc3 & 3) << 6) | enc4;

    result += String.fromCharCode(byte1);
    if (enc3 !== 64 && enc3 !== -1) result += String.fromCharCode(byte2);
    if (enc4 !== 64 && enc4 !== -1) result += String.fromCharCode(byte3);
  }
  
  try {
    return decodeURIComponent(escape(result));
  } catch (e) {
    return result; // Fallback to raw string
  }
};
