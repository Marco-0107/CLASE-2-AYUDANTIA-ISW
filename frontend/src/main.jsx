import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Register from '@pages/Register';
import Pilotos from '@pages/Pilotos';
import GenerarQR from '@pages/GenerarQR';
import EscanearQR from '@pages/EscanearQR';
import Chat from '@pages/Chat';
import ChatPiloto from '@pages/ChatPiloto';
import Eventos from '@pages/Eventos';
import Root from '@pages/Root';
import App from '@pages/App';
import '@styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Root />,        children: [
          {
            path: '/',
            element: <Pilotos />
          },
          {
            path: '/pilotos',
            element: <Pilotos />
          },
          {
            path: '/generar-qr',
            element: <GenerarQR />
          },          {
            path: '/escanear-qr',
            element: <EscanearQR />
          },          {
            path: '/chat',
            element: <Chat />
          },
          {
            path: '/chat-piloto',
            element: <ChatPiloto />
          },
          {
            path: '/eventos',
            element: <Eventos />
          }
        ]
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);