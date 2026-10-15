import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import { LoginPage, RegisterPage } from "../features/auth";
import { HomePage } from "../features/find/HomePage";
import { GuestOnly, RequireAuth } from "./AuthGuards";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                element: <RequireAuth />,
                children: [
                    { index: true, element: <HomePage /> },
                ],
            },
            {
                element: <GuestOnly />,
                children: [
                    { path: "login", element: <LoginPage /> },
                    { path: "register", element: <RegisterPage /> },
                ],
            },
        ]
    }
])