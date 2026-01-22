// const API_BASE_URL = "http://localhost:8081/api";

// export const authService = {
//     async login(email, password) {
//         const response = await fetch(`${API_BASE_URL}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password }),
//         });

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             throw new Error(errorData.message || "Invalid credentials");
//         }

//         return await response.json();
//     },

//     async register(userData) {
//         const response = await fetch(`${API_BASE_URL}/auth/register`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(userData),
//         });

//         if (!response.ok) {
//             const errorMsg = await response.text();
//             throw new Error(errorMsg || "Registration failed");
//         }

//         // The backend RegisterResponse includes a token, so we can treat it similarly to login if needed
//         return await response.json();
//     },

//     logout() {
//         localStorage.removeItem("skillforge_token");
//         localStorage.removeItem("skillforge_role");
//         localStorage.removeItem("skillforge_user");
//     }
// };
const API_BASE_URL = "http://localhost:8081/api";

export const authService = {
    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Invalid credentials");
        }

        // 🔥 BACKEND RETURNS DIRECT OBJECT
        // { token, email, role }
        return await response.json();
    },

    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.message || "Invalid credentials");
        }


        return await response.json();
    },

    logout() {
        localStorage.removeItem("skillforge_token");
        localStorage.removeItem("skillforge_role");
        localStorage.removeItem("skillforge_user");
    }
};
