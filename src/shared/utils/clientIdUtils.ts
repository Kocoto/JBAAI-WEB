// src/shared/utils/clientIdUtils.ts

import { v4 as uuidv4 } from "uuid";

const CLIENT_ID_KEY = "device_client_id";
const CLIENT_INFO_KEY = "device_client_info";

interface ClientInfo {
  clientId: string;
  deviceType: string;
  browser: string;
  os: string;
  createdAt: string;
  lastUsed: string;
}

/**
 * Lấy thông tin về browser
 */
const getBrowserInfo = (): { browser: string; os: string } => {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  // Detect browser
  if (userAgent.indexOf("Firefox") > -1) {
    browser = "Firefox";
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    browser = "Opera";
  } else if (userAgent.indexOf("Trident") > -1) {
    browser = "Internet Explorer";
  } else if (userAgent.indexOf("Edge") > -1) {
    browser = "Edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    browser = "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    browser = "Safari";
  }

  // Detect OS
  if (userAgent.indexOf("Windows NT 10.0") > -1) {
    os = "Windows 10";
  } else if (userAgent.indexOf("Windows NT 6.3") > -1) {
    os = "Windows 8.1";
  } else if (userAgent.indexOf("Windows NT 6.2") > -1) {
    os = "Windows 8";
  } else if (userAgent.indexOf("Windows NT 6.1") > -1) {
    os = "Windows 7";
  } else if (userAgent.indexOf("Mac OS X") > -1) {
    os = "Mac OS X";
  } else if (userAgent.indexOf("Android") > -1) {
    os = "Android";
  } else if (
    userAgent.indexOf("iOS") > -1 ||
    userAgent.indexOf("iPhone") > -1 ||
    userAgent.indexOf("iPad") > -1
  ) {
    os = "iOS";
  } else if (userAgent.indexOf("Linux") > -1) {
    os = "Linux";
  }

  return { browser, os };
};

/**
 * Lấy loại thiết bị
 */
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return "Tablet";
  }

  if (
    /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
      userAgent
    )
  ) {
    return "Mobile";
  }

  return "Desktop";
};

/**
 * Tạo một client ID mới với thông tin thiết bị
 */
const generateClientInfo = (): ClientInfo => {
  const { browser, os } = getBrowserInfo();
  const deviceType = getDeviceType();
  const now = new Date().toISOString();

  return {
    clientId: `${deviceType.toLowerCase()}-${uuidv4()}`,
    deviceType,
    browser,
    os,
    createdAt: now,
    lastUsed: now,
  };
};

/**
 * Lấy hoặc tạo client ID cho thiết bị hiện tại
 */
export const getClientId = (): string => {
  // Kiểm tra xem đã có client ID trong localStorage chưa
  let clientInfo = getClientInfo();

  if (!clientInfo) {
    // Nếu chưa có, tạo mới
    clientInfo = generateClientInfo();
    saveClientInfo(clientInfo);
  } else {
    // Cập nhật thời gian sử dụng cuối
    clientInfo.lastUsed = new Date().toISOString();
    saveClientInfo(clientInfo);
  }

  return clientInfo.clientId;
};

/**
 * Lấy thông tin client đầy đủ
 */
export const getClientInfo = (): ClientInfo | null => {
  try {
    const storedInfo = localStorage.getItem(CLIENT_INFO_KEY);
    if (storedInfo) {
      return JSON.parse(storedInfo);
    }
  } catch (error) {
    console.error("Error reading client info:", error);
  }
  return null;
};

/**
 * Lưu thông tin client
 */
const saveClientInfo = (clientInfo: ClientInfo): void => {
  try {
    localStorage.setItem(CLIENT_INFO_KEY, JSON.stringify(clientInfo));
    localStorage.setItem(CLIENT_ID_KEY, clientInfo.clientId);
  } catch (error) {
    console.error("Error saving client info:", error);
  }
};

/**
 * Xóa client ID (có thể dùng khi cần reset)
 */
export const clearClientId = (): void => {
  localStorage.removeItem(CLIENT_ID_KEY);
  localStorage.removeItem(CLIENT_INFO_KEY);
};

/**
 * Kiểm tra xem client ID có hợp lệ không
 */
export const isValidClientId = (clientId: string): boolean => {
  // Kiểm tra format: devicetype-uuid
  const pattern =
    /^(desktop|mobile|tablet)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return pattern.test(clientId);
};

/**
 * Lấy thông tin thiết bị hiện tại (không lưu)
 */
export const getCurrentDeviceInfo = () => {
  const { browser, os } = getBrowserInfo();
  const deviceType = getDeviceType();

  return {
    deviceType,
    browser,
    os,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
