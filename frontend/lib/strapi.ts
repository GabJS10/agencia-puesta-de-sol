export const { STRAPI_HOST, STRAPI_TOKEN } = process.env;

export async function query(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${STRAPI_HOST}/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    ...options,
  });
  return await response.json();
}
