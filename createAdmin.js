const url = "http://localhost:8000/api/v1/auth/register-admin";

const body = {
  fullName: "Nova Admin",
  email: "admin@nova.com",
  password: "Admin@1234",
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
})
  .then(async (res) => {
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error("Error connecting to server:", err.message);
  });
