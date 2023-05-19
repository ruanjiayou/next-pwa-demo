import React, { useState } from 'react';
import { useRouter } from 'next/router'
import { runInAction } from 'mobx';
import { Layout, Menu, theme, Spin } from 'antd';
import { Observer, useLocalObservable, } from 'mobx-react-lite';
import { AiOutlineHistory, AiOutlineBug, AiOutlineTrademark } from 'react-icons/ai'
import "antd/dist/reset.css";
import "fe/styles/globals.css"
import { useEffectOnce } from 'react-use';

const { Header, Content, Footer, Sider } = Layout;
const MenuItems = [
  { name: '/records', title: '记录', icon: <AiOutlineHistory />, path: '/records' },
  { name: '/rules', title: '规则', icon: <AiOutlineBug />, path: '/rules' },
  { name: '/resources', title: '资源', icon: <AiOutlineTrademark />, path: '/resources' }
]

function SelfLayout({ children }) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  let timer = null;
  useEffectOnce(() => {
    function start() {
      timer = setTimeout(() => {
        setIsLoading(true)
      }, 100)

    }
    function finish() {
      clearTimeout(timer);
      timer = null;
      setIsLoading(false)
    }
    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', finish)
    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', finish)
    }
  })
  const local = useLocalObservable(() => ({
    currentKey: router.pathname
  }));
  return <Observer>{() => (<Layout style={{ height: '100%' }}>
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
    >
      <div className="logo" />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[local.currentKey]}
        onSelect={({ item, key, keyPath, selectedKeys, }) => {
          router.push(key)
          runInAction(() => {
            local.currentKey = key;
          })
        }}
        items={MenuItems.map(
          (item, index) => ({
            key: item.name,
            icon: item.icon,
            label: <span>{item.title}</span>,
          }),
        )}
      />
    </Sider>
    <Layout>
      <Header style={{ padding: 0, background: colorBgContainer }} />
      <Content style={{ position: 'relative' }}>
        {children}
        {isLoading && (
          <div style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.8)', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center', justifyItems: 'center' }}>
            <Spin spinning></Spin>
          </div>
        )}
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by Ant UED</Footer>
    </Layout>
  </Layout>)
  }</Observer >
}

export default function MyApp({ Component, pageProps }) {
  return (
    <SelfLayout>
      <Component {...pageProps} />
    </SelfLayout>
  )
}
