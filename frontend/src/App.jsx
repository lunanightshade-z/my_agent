/**
 * 主应用组件 - 路由配置
 */
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import store from './store/store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Agent from './pages/Agent';

function App() {
  return (
    <Provider store={store}>
      <Router basename="/">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/agent" element={<Agent />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

