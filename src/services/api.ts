const API_URL = "http://localhost:5000/api";

export async function getData(endpoint: string) {
  const res = await fetch(`${API_URL}/${endpoint}`);
  return res.json();
}

export async function postData(endpoint: string, body: unknown) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return res.json();
}
