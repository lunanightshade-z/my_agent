/**
 * 主应用组件
 * 组合所有子组件，构建完整的聊天界面
 */
import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import ChatHistory from './components/ChatHistory';
import ChatMain from './components/ChatMain';
import Toast from './components/Toast';

function App() {
  return (
    <Provider store={store}>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-mint-50 via-white to-sky-fresh-50">
        <div className="h-full flex">
          {/* 左侧历史面板 */}
          <div className="w-80 h-full">
            <ChatHistory />
          </div>

          {/* 右侧主聊天区域 */}
          <div className="flex-1 h-full">
            <ChatMain />
          </div>
        </div>
        
        {/* 全局 Toast 通知 */}
        <Toast />
      </div>
    </Provider>
  );
}

export default App;

