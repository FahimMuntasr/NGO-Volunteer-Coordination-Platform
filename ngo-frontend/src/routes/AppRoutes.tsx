// src/routes/AppRoutes.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import EventDetails from "../pages/EventDetails";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/events" element={<Events />} />
                <Route path="/dashboard/profile" element={<Profile />} />

                <Route path="/dashboard/events/:id" element={<EventDetails />} />

                <Route path="*" element={<NotFound />} />
                
            </Routes>
        </BrowserRouter>
    );
}