import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import DefaultLayout from "@/components/DefaultLayout";
import GuestLayout from "@/components/GuestLayout";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Signup from "@/pages/Signup";
import Users from "@/pages/Users";
import UserForm from "@/pages/UserForm";
import { useAuth } from "@/context/AuthContext";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><DefaultLayout/></ProtectedRoute>,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard"/>
      },
      {
        path: '/dashboard',
        element: <Dashboard/>
      },
      {
        path: '/users',
        element: <Users/>
      },
      {
        path: '/users/new',
        element: <UserForm key="userCreate" />
      },
      {
        path: '/users/:id',
        element: <UserForm key="userUpdate" />
      }
    ]
  },
  {
    path: '/',
    element: <GuestLayout/>,
    children: [
      {
        path: '/login',
        element: <Login/>
      },
      {
        path: '/signup',
        element: <Signup/>
      }
    ]
  },
  {
    path: "*",
    element: <NotFound/>
  }
]);

export default router; 