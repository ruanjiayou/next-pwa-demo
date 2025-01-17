import _ from 'lodash'
import React, { useState, useRef } from 'react';
import { Button, Modal, Input, Form, Card, Select, Radio, notification, Space, Switch, } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import { Observer, useLocalStore } from 'mobx-react-lite';
import CodeEditor from '@/modules/code-editor'
import styled from 'styled-components';

// const CodeEditor = dynamic(() =>
//   import('@/modules/editor'),
//   { loading: <p>加载中...</p> }
// )

// const CloseBtn = styled.div`
//   position: absolute;
//   right: -20px;
//   top: 0;
//   cursor: pointer;
//   background: wheat;
//   z-index: 2;
//   width: 20px;
//   height: 20px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `
const Item = Form.Item;

export default function RuleEdit({ data, cancel, save }) {
  const local = useLocalStore(() => ({
    editORadd: data._id ? 'edit' : 'add',
    data: data._id ? _.cloneDeep(data) : { config: { html: 0, proxy: 0, cookie: 0 }, poster: '', urls: [], pattern: '', open: false, status: 0 },
    loading: false,
    ref: '',
    poster: data.poster || '',
    maps: [],
    tagAddVisible: false,
    typeAddVisible: false,
    urlAddVisible: false,
    tempTag: '',
    tempType: '',
    tempUrl: '',
    fullscreen: false,
  }))
  const urlRef = useRef(null)
  return <Observer>{() => (<div>
    <Modal
      width={750}
      title={local.editORadd === 'add' ? '添加' : "修改"}
      open={true}
      okText={local.editORadd === 'add' ? '添加' : "修改"}
      cancelText="取消"
      maskClosable={false}
      onOk={async () => {
        local.loading = true
        await save(local.data);
        local.loading = false;
      }}
      onCancel={() => {
        cancel();
      }}>
      <Form>
        <Item label="id:" labelCol={{ span: 4 }}>
          <Input disabled={local.editORadd === 'edit'} onChange={e => local.data._id = e.target.value} defaultValue={local.data._id} />
        </Item>
        <Item label="名称:" labelCol={{ span: 4 }}>
          <Input value={local.data.name} autoFocus onChange={e => local.data.name = e.target.value} defaultValue={local.data.name} />
        </Item>
        <Item label="描述:" labelCol={{ span: 4 }} defaultValue={local.data.desc}>
          <Input.TextArea />
        </Item>
        <Item label="config" labelCol={{ span: 4 }}>
          <Card>
            <Item label="proxy" labelCol={{ span: 4 }}>
              <Radio.Group name="proxy" defaultValue={local.data.config.proxy} onChange={e => local.data.config.proxy = e.target.value}>
                <Radio value={0}>无</Radio>
                <Radio value={1}>有</Radio>
              </Radio.Group>
            </Item>
            <Item label="html" labelCol={{ span: 4 }}>
              <Radio.Group name="html" defaultValue={local.data.config.html} onChange={e => local.data.config.html = e.target.value}>
                <Radio value={0}>不必</Radio>
                <Radio value={1}>可选</Radio>
                <Radio value={2}>必须</Radio>
              </Radio.Group>
            </Item>
            <Item label="cookie" labelCol={{ span: 4 }}>
              <Radio.Group name="cookie" defaultValue={local.data.config.cookie} onChange={e => local.data.config.cookie = e.target.value}>
                <Radio value={0}>不必</Radio>
                <Radio value={1}>可选</Radio>
                <Radio value={2}>必须</Radio>
              </Radio.Group>
            </Item>
          </Card>
        </Item>
        <Item label="状态" labelCol={{ span: 4 }}>
          <Radio.Group name="status" defaultValue={local.data.status} onChange={e => {
            local.data.status = e.target.value;
          }}>
            <Radio value={0}>已创建</Radio>
            <Radio value={1}>运行中</Radio>
            <Radio value={2}>已废弃</Radio>
            <Radio value={3}>等待中</Radio>
          </Radio.Group>
        </Item>
        <Item label="规则" labelCol={{ span: 4 }}>
          <Space direction='vertical' style={{ width: '100%' }}>
            {local.data.urls.length === 0 && <label style={{ lineHeight: '32px' }}>暂无数据</label>}
            {local.data.urls.map((item, i) => <Input key={i} value={item.url} readOnly addonAfter={<Switch checked={item.enabled} onChange={v => item.enabled = v} />} addonBefore={item.enabled ? '开启' : '关闭'} />)}
            <Input addonBefore="添加" ref={ref => urlRef.current = ref} addonAfter={<CheckCircleTwoTone onClick={() => {
              if (urlRef.current) {
                const url = urlRef.current.input.value.trim();
                if (url) {
                  local.data.urls.push({ url, enabled: false });
                } else {
                  notification.warning({ message: '请输入有效规则' })
                }
              }
            }} />} />
          </Space>
        </Item>
        <div style={{
          position: local.fullscreen ? 'absolute' : 'relative',
          left: 0,
          top: 0,
          width: '100%',
          height: !local.fullscreen ? 400 : '100%',
          zIndex: 1011,
          backgroundColor: 'wheat',
        }}>
          <div onClick={() => { local.fullscreen = !local.fullscreen;
           }}>
            {local.fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </div>
          <CodeEditor value={local.data.script} onChange={v => local.data.script = v} />
        </div>
      </Form>
    </Modal>
  </div>)}</Observer>;
}