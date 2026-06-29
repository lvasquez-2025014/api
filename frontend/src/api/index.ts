const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : "");

export const fetchSellerData = async (endpoint: string, ownerId: string, secret: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/seller/${endpoint}`, {
    headers: {
      "x-owner-id": ownerId,
      "x-secret": secret,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const postSellerData = async (endpoint: string, data: any, ownerId: string, secret: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/seller/${endpoint}`, {
    method: "POST",
    headers: {
      "x-owner-id": ownerId,
      "x-secret": secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const postClientData = async (endpoint: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/client/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
