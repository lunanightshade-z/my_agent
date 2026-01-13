/**
 * 主应用组件 - 路由配置
 * 参考设计原则和三层架构
 */
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import store from './store/store';
import AppLayout from './components/layout/AppLayout.jsx';
import Chat from './pages/Chat';
import Agent from './pages/Agent';
import Home from './pages/Home';

function App() {
  return (
    <Provider store={store}>
      <Router basename="/">
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/agent" element={<Agent />} />
          </Routes>
        </AppLayout>
      </Router>
    </Provider>
  );
}

export default App;
