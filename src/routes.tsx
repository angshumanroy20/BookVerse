import Home from './pages/Home';
import Browse from './pages/Browse';
import BookDetail from './pages/BookDetail';
import UploadBook from './pages/UploadBook';
import MyLibrary from './pages/MyLibrary';
import Admin from './pages/Admin';
import Login from './pages/Login';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    visible: true
  },
  {
    name: 'Browse',
    path: '/browse',
    element: <Browse />,
    visible: true
  },
  {
    name: 'Book Detail',
    path: '/book/:id',
    element: <BookDetail />,
    visible: false
  },
  {
    name: 'Upload Book',
    path: '/upload',
    element: <UploadBook />,
    visible: false
  },
  {
    name: 'My Library',
    path: '/my-library',
    element: <MyLibrary />,
    visible: false
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    visible: false
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  }
];

export default routes;