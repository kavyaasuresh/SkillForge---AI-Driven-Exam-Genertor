// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const storedUser = localStorage.getItem("skillforge_user");
//         const storedToken = localStorage.getItem("skillforge_token");
//         if (storedUser && storedToken) {
//             setUser(JSON.parse(storedUser));
//         }
//         setLoading(false);
//     }, []);

//     const login = (userData) => {
//         setUser(userData);
//         localStorage.setItem("skillforge_token", userData.token);
//         localStorage.setItem("skillforge_user", JSON.stringify(userData));
//         localStorage.setItem("skillforge_role", userData.role);
//     };

//     const logout = () => {
//         setUser(null);
//         localStorage.removeItem("skillforge_token");
//         localStorage.removeItem("skillforge_user");
//         localStorage.removeItem("skillforge_role");
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading }}>
//             {!loading && children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// };
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("skillforge_user");
        const storedToken = localStorage.getItem("skillforge_token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        if (!userData?.token) {
            console.error("Login failed: token missing", userData);
            return;
        }

        // Preserve existing profile data if new data is empty
        const existingUser = user || {};
        const mergedUserData = {
            ...userData,
            fullName: userData.fullName || userData.name || existingUser.fullName || userData.name,
            profilePic: userData.profilePic || existingUser.profilePic || "",
            phone: userData.phone || existingUser.phone || "",
            bio: userData.bio || existingUser.bio || "",
            department: userData.department || existingUser.department || ""
        };

        setUser(mergedUserData);
        localStorage.setItem("skillforge_token", userData.token);
        localStorage.setItem("skillforge_user", JSON.stringify(mergedUserData));
        localStorage.setItem("skillforge_role", userData.role);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("skillforge_token");
        localStorage.removeItem("skillforge_user");
        localStorage.removeItem("skillforge_role");
    };

    const updateUser = (updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        localStorage.setItem("skillforge_user", JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
