const host = import.meta.env.DEV ? "http://localhost:7000" : "";

export const agent = async (
  method: "POST" | "GET" | "PUT" | "DELETE",
  endpoint: string,
  body?: object
): Promise<unknown> => {
  return await fetch(`${host}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  }).then((res) => res.json());
};

export const buildEventSource = () => new EventSource(`${host}/listen`);
