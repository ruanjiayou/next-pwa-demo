import _ from 'lodash'
import React, { useState, useCallback, } from 'react';
import { useEffectOnce } from 'react-use';
import { Button, Space, Table, notification, Popconfirm, Modal, Select, Input, Form, } from 'antd';
import { Observer, useLocalObservable, } from 'mobx-react-lite';
import { AiTwotoneEdit, AiTwotoneDelete, AiTwotoneRocket, AiOutlineReload } from 'react-icons/ai'
import RuleEdit from "@/modules/rule/edit";
import apis from '@/apis'
import { Wrap } from '@/component'
import { match } from 'path-to-regexp'
import { IconWrap } from '@/component/index.js'

const RuleStatus = {
  0: { text: '开发中', color: 'blue' },
  1: { text: "使用中", color: 'green' },
  2: { text: "已废弃", color: "red" },
  3: { text: "待上线", color: "#cad100" },
}

export const getServerSideProps = async (ctx) => {
  const { MSpider } = ctx.res.models;
  const items = await MSpider.getList({});
  const total = await MSpider.count();
  return {
    props: {
      static: JSON.stringify({ items, total }),
    },
  };
};

export default function RulePage(props) {
  const { items, total } = JSON.parse(props.static);
  const [isChrome, setIsCrome] = useState(false);
  const [form] = Form.useForm()
  const local = useLocalObservable(() => ({
    tempData: {},
    items: items,
    page: 1,
    limit: 20,
    matchURL: {
      open: false,
      loading: false,
      url: '',
      matched_rule_id: '',
      params: null,
      isComposition: false,
    }
  }))
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffectOnce(() => {
    setIsCrome(window.navigator.userAgent.includes('Chrome'))
    return () => {

    }
  })
  const editData = async (data) => {
    local.tempData = data;
    setIsModalOpen(true);
  }
  const getRules = async () => {
    const result = await apis.getRules({ page: local.page, limit: local.limit })
    if (result.code === 0) {
      local.rules = result.data.items;
    } else {
      notification.error({ message: '获取数据失败' })
    }
  }
  function openMatch() {
    local.matchURL.matched_rule_id = '';
    local.matchURL.url = '';
    local.matchURL.open = true;
    local.matchURL.isComposition = false;
    local.matchURL.params = null;
  }
  function closeMatch() {
    local.matchURL.params = null;
    form.setFieldValue('url', '')
    local.matchURL.open = false;
  }
  const onCrawl = async () => {
    local.matchURL.loading = true
    try {
      const result = await apis.patchRule(local.matchURL.matched_rule_id, { url: local.matchURL.url, params: local.matchURL.params })
      form.setFieldValue('url', '')
      local.matchURL.open = false
    } catch (e) {

    } finally {
      local.matchURL.loading = false;
    }
  }
  const matchUrl = (link) => {
    if (!link || !link.startsWith('http')) {
      return null;
    }
    const url1 = new window.URL(link)
    let found = null;
    for (let i = 0; i < local.rules.length; i++) {
      const rule = local.rules[i];
      const url_pattern = rule.pattern;
      const url2 = new window.URL(url_pattern);
      if (url_pattern.startsWith(url1.origin)) {
        const fn = match(url2.pathname, { decode: decodeURIComponent })
        const result = fn(url1.pathname)
        if (result.params) {
          found = result.params;
          [...url2.searchParams.entries()].forEach(([key, value]) => {
            if (value.startsWith(':')) {
              value = url1.searchParams.get(key).substring(1);
              found[key] = value;
            }
          })
          local.matchURL.url = link;
          local.matchURL.matched_rule_id = rule._id;
          local.matchURL.params = found
          break;
        }
      }
      if (found) {
        break;
      }
    }
  }
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: "_id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: '标识',
      dataIndex: '_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: '_id',
      render: (status) => <span style={{ color: RuleStatus[status].color }} >{RuleStatus[status].text}</span>
    },
    {
      title: '匹配规则',
      key: 'pattern',
      dataIndex: 'pattern',
    },
    {
      title: '操作',
      key: '_id',
      render: (_, record) => (
        <Space size="middle">
          <IconWrap>
            <AiTwotoneEdit onClick={() => {
              editData(record);
            }} />
          </IconWrap>
          <Popconfirm
            title="提示"
            description="确定要删除吗?"
            onConfirm={async () => {
              try {
                await apis.destroyRule(record)
                await getRules()
              } catch (e) {
                notification.error({ message: '删除失败' })
              }
            }}
            okText="确认"
            cancelText="取消"
          >
            <IconWrap>
              <AiTwotoneDelete />
            </IconWrap>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  return <Observer>{() => (<div>
    <Wrap size="middle" style={{ margin: 8 }}>
      <Space size={"small"}>
        <Button type="primary" onClick={() => { local.tempData = {}; setIsModalOpen(true) }}>添加</Button>
        <Button type='primary' onClick={openMatch}>抓取</Button>
        <Button type="primary">
          <AiOutlineReload onClick={() => getRules()} color="#blue" />
        </Button>
      </Space>
    </Wrap>
    {isModalOpen && <RuleEdit cancel={() => setIsModalOpen(false)} data={local.tempData} save={async (data) => {
      const result = local.tempData._id ? await apis.updateRule(local.tempData._id, data) : await apis.createRule(data)
      if (result.code === 0) {
        await getRules()
        notification.info({ message: '保存成功' });
        setIsModalOpen(false);
      } else {
        notification.warning({ message: result.message })
      }
    }} />}
    <Table columns={columns} dataSource={local.rules} rowKey="_id" />
    <Modal
      open={local.matchURL.open}
      footer={<Space>
        <Button onClick={closeMatch}>取消</Button>
        <Button
          loading={local.matchURL.loading}
          type="primary"
          disabled={local.matchURL.matched_rule_id === ''}
          onClick={onCrawl}
        >抓取</Button>
      </Space>}
      onCancel={closeMatch}
    >
      <Form form={form}>
        <Form.Item label="规则" labelCol={{ span: 2 }} style={{ marginTop: 32 }} >
          <Select disabled value={local.matchURL.matched_rule_id}>
            <Select.Option value="">无</Select.Option>
            {local.items.map(rule => (<Select.Option key={rule._id} value={rule._id}>{rule.name}</Select.Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="地址" labelCol={{ span: 2 }} name="url">
          <Input
            autoFocus
            onPaste={(e) => {
              matchUrl(e.target.value)
            }}
            onChange={(e) => {
              if (!local.matchURL.isComposition) {
                matchUrl(e.target.value)
              }
            }}
            onCompositionStart={() => {
              local.matchURL.isComposition = true
            }}
            onCompositionEnd={(e) => {
              local.matchURL.isComposition = false
              matchUrl(e.target.value)
            }} />
        </Form.Item>
      </Form>
    </Modal>
  </div>)
  }</Observer >;
}