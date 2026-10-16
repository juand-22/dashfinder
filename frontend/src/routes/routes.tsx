import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import { LoginPage, RegisterPage } from "../features/auth";
import { HomePage } from "../features/find/HomePage";
import { DashmodPage } from "../features/dashmod/pages/DashmodPage";
import { TusServidoresPage } from "../features/tus-servidores/pages/TusServidoresPage";
import { ConfiguracionPage } from "../features/configuracion/pages/ConfiguracionPage";
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
                    { path: "dashmod", element: <DashmodPage /> },
                    { path: "tus-servidores", element: <TusServidoresPage /> },
                    { path: "configuracion", element: <ConfiguracionPage /> },
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