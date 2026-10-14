import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import { LoginPage, RegisterPage } from "../features/auth";
import { GuestOnly, RequireAuth } from "./AuthGuards";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                element: <RequireAuth />,
                children: [
                    { index: true, element: <div>Home</div> },
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