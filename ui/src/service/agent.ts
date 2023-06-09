export const agent = async (
  method: "POST" | "GET" | "PUT" | "DELETE",
  endpoint: string,
  body?: object
): Promise<unknown> => {
  return await fetch(`http://localhost:5000${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  }).then((res) => res.json());
};
