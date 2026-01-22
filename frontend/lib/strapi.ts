const { STRAPI_HOST, STRAPI_TOKEN } = process.env;

export async function query(endpoint: string) {
  const response = await fetch(`${STRAPI_HOST}/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
  });
  return await response.json();
}
