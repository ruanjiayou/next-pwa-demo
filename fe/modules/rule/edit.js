import _ from 'lodash'
import React, { useState, useRef } from 'react';
import { Button, Modal, Input, Form, Select, Radio, notification, Space, } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons'
import { Observer, useLocalStore } from 'mobx-react-lite';
import CodeEditor from '@/modules/code-editor'

// const CodeEditor = dynamic(() =>
//   import('@/modules/editor'),
//   { loading: <p>加载中...</p> }
// )

const Item = Form.Item;

export default function RuleEdit({ data, cancel, save }) {
  const local = useLocalStore(() => ({
    editORadd: data._id ? 'edit' : 'add',
    data: data._id ? _.cloneDeep(data) : { type: 'single', proxy: 0, mode: 'request', poster: '', urls: [], open: false, status: 0 },
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
  }))
  const urlRef = useRef(null)
  return <Observer>{() => (<div>
    <Modal
      width={750}
      title={local.editORadd === 'add' ? '添加' : "修改"}
      open={true}
      okText={local.editORadd === 'add' ? '添加' : "修改"}
      cancelText="取消"
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
          <Input value={local.data.title} autoFocus onChange={e => local.data.title = e.target.value} defaultValue={local.data.name} />
        </Item>
        <Item label="描述:" labelCol={{ span: 4 }} defaultValue={local.data.desc}>
          <Input.TextArea />
        </Item>
        <Item label="类型:" labelCol={{ span: 4 }}>
          <Radio.Group name="type" defaultValue={"single"} onChange={e => local.data.type = e.target.value}>
            <Radio value={"single"}>单页</Radio>
            <Radio value={"pagination"}>分页</Radio>
          </Radio.Group>
        </Item>
        <Item label="模式" labelCol={{ span: 4 }}>
          <Radio.Group name="mode" defaultValue={"request"} onChange={e => local.data.mode = e.target.value}>
            <Radio value={'browser'}>browser</Radio>
            <Radio value={"puppeteer"}>puppeteer</Radio>
            <Radio value={"request"}>request</Radio>
          </Radio.Group>
        </Item>
        <Item label="代理" labelCol={{ span: 4 }}>
          <Radio.Group name="proxy" defaultValue={0} onChange={e => local.data.proxy = e.target.value}>
            <Radio value={0}>无</Radio>
            <Radio value={1}>有</Radio>
          </Radio.Group>
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
            {local.data.urls.map((url, i) => <Input key={i} value={url} readOnly addonAfter={<CloseCircleTwoTone onClick={() => {
              local.data.urls.splice(i, 1)
            }} />} />)}
            <Input addonBefore="添加" ref={ref => urlRef.current = ref} addonAfter={<CheckCircleTwoTone onClick={() => {
              if (urlRef.current) {
                const url = urlRef.current.input.value.trim();
                if (url) {
                  local.data.urls.push(url);
                } else {
                  notification.warning({ message: '请输入有效规则' })
                }
              }
            }} />} />
          </Space>
        </Item>
        <Item>
          <CodeEditor style={{ height: 400, overflow: 'auto' }} value={local.data.script} onChange={v => local.data.script = v} />
        </Item>
      </Form>
    </Modal>
  </div>)}</Observer>;
}