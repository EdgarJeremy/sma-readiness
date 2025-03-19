import { Authenticated, Refine, useGetIdentity } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  notificationProvider,
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";

import { BrowserRouter, HashRouter, Outlet, Route, Routes } from "react-router-dom";
import { getAuthProvider } from "./authProvider";
import { getDataProvider } from './dataProvider'
import { feathersClient } from './feathers';
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  DashboardOwn,
  ItemCreate,
  ItemEdit,
  ItemList,
  ItemShow,
  ItemStation,
} from "./pages/items";
import {
  DashboardVhs,
  VhsCreate,
  VhsEdit,
  VhsList,
  VhsShow,
  VhsStation
} from './pages/vhs';
import { InviteeCreate, InviteeEdit } from './pages/invitees'
import {
  UserCreate,
  UserEdit,
  UserList,
  UserShow,
} from "./pages/users";

import { UserOutlined, } from '@ant-design/icons';

import { Login } from "./pages/login";
import { accessControlProvider } from "./accessControlProvider";
import { SummaryPage } from "./pages/items/summary";
import { WelcomePage } from "./pages/items/welcome";
import logo from './sma-logo.png';
import React, { useState, useEffect } from "react";

function App() {

  return (
    <HashRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <Refine
            dataProvider={getDataProvider(import.meta.env.VITE_API_URL, feathersClient)}
            notificationProvider={notificationProvider}
            routerProvider={routerBindings}
            authProvider={getAuthProvider(feathersClient)}
            accessControlProvider={accessControlProvider(feathersClient)}
            resources={[
              {
                name: 'items',
                list: '/items',
                create: '/items/create',
                edit: '/items/edit/:id',
                show: '/items/show/:id',
                meta: {
                  canDelete: true,
                },
              },
              // {
              //   name: 'vhs',
              //   list: '/vhs',
              //   create: '/vhs/create',
              //   edit: '/vhs/edit/:id',
              //   show: '/vhs/show/:id',
              //   meta: {
              //     label: 'VHS Stock',
              //     canDelete: true
              //   }
              // },
              {
                name: 'invitees',
                create: '/events/show/:event_id/invitees/create',
                edit: '/events/show/:event_id/invitees/edit/:id',
                meta: {
                  canDelete: true
                }
              },
              {
                name: 'users',
                list: '/users',
                create: '/users/create',
                edit: '/users/edit/:id',
                show: '/users/show/:id',
                meta: {
                  icon: <UserOutlined />,
                  canDelete: true,
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: 'TEmY94-cVBSF3-czt93T',
              disableTelemetry: true
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2
                      Title={({ collapsed }) => (
                        <ThemedTitleV2
                          collapsed={collapsed}
                          text="SMA Readiness Dashboard"
                          icon={<img src={logo} width={20} height={35} style={{ marginTop: -10 }} />}
                        />
                      )}
                      Header={() => <Header sticky />}
                      Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<Redir />}
                />
                <Route path="/items">
                  <Route index element={<ItemList client={feathersClient} />} />
                  <Route path="create" element={<ItemCreate />} />
                  <Route path="edit/:id" element={<ItemEdit />} />
                </Route>
                <Route path="/vhs">
                  <Route index element={<VhsList client={feathersClient} />} />
                  <Route path="create" element={<VhsCreate />} />
                  <Route path="edit/:id" element={<VhsEdit />} />
                </Route>
                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path="create" element={<UserCreate />} />
                  <Route path="edit/:id" element={<UserEdit />} />
                  <Route path="show/:id" element={<UserShow />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route path="dashboard_own" element={<DashboardOwn client={feathersClient} />} />
              <Route path="station/:item_id" element={<ItemStation client={feathersClient} />} />
              <Route path="welcome/:item_id" element={<WelcomePage client={feathersClient} />} />
              <Route path="summary/:shorturi" element={<SummaryPage client={feathersClient} />} />
              <Route
                element={
                  <Authenticated fallback={<Outlet />}>
                    {/* <NavigateToResource /> */}
                    <Redir />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>

            <RefineKbar />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </HashRouter>
  );
}

type IUser = {
  id: number;
  name: string;
  avatar: string;
  type: string;
}

const Redir: React.FC = () => {
  const { data: user } = useGetIdentity<IUser>();

  return <NavigateToResource  resource={user?.type == 'Administrator' ? 'items' : 'vhs'}/>
}

export default App;
