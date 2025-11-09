import Home from './pages/Home';
import Browse from './pages/Browse';
import BookDetail from './pages/BookDetail';
import UploadBook from './pages/UploadBook';
import EditBook from './pages/EditBook';
import MyLibrary from './pages/MyLibrary';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Profile from './pages/Profile';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  requireAuth?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    visible: true,
    requireAuth: false
  },
  {
    name: 'Browse',
    path: '/browse',
    element: <Browse />,
    visible: true,
    requireAuth: false
  },
  {
    name: 'Book Detail',
    path: '/book/:id',
    element: <BookDetail />,
    visible: false,
    requireAuth: false
  },
  {
    name: 'Upload Book',
    path: '/upload',
    element: <UploadBook />,
    visible: false,
    requireAuth: true
  },
  {
    name: 'Edit Book',
    path: '/book/:id/edit',
    element: <EditBook />,
    visible: false,
    requireAuth: true
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    visible: false,
    requireAuth: true
  },
  {
    name: 'My Library',
    path: '/my-library',
    element: <MyLibrary />,
    visible: false,
    requireAuth: true
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <Profile />,
    visible: false,
    requireAuth: true
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    visible: false,
    requireAuth: true
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
    requireAuth: false
  }
];

export default routes;