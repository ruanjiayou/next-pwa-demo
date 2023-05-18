import _ from 'lodash'
import React, { useState, useCallback, } from 'react';
import { useEffectOnce } from 'react-use';
import Link from 'next/link';
import { Button, Space, Table, notification, Popconfirm, Modal, Select, Input, Form, Tag, } from 'antd';
import { Observer, useLocalObservable, } from 'mobx-react-lite';
import { BsSend, BsSendCheck } from 'react-icons/bs'
import { AiTwotoneEdit, AiTwotoneDelete, AiTwotoneRocket, AiOutlineReload, AiOutlineLine } from 'react-icons/ai'
import apis from 'fe/apis'
import { Wrap } from '@/component'
import { match } from 'path-to-regexp'
import { parse } from 'url'
import constant from '~/constant.js';

const RecordStatus = {
  1: { text: "已创建", color: '#38b1eb' },
  2: { text: "处理中", color: "#cad100" },
  3: { text: "已完成", color: "#2ec4b6" },
  3: { text: "出错", color: "#f36" },
  3: { text: "已停止", color: "#136199" },
}

export default function RecordPage() {
  const local = useLocalObservable(() => ({
    records: [],
    loading: false,
    page: 1,
    limit: 20,
  }));
  const columns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: '_id',
      render: (status) => (<Tag color={RecordStatus[status].color}>{RecordStatus[status].text}</Tag>)
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: "_id",
    },
    {
      title: '原地址',
      dataIndex: 'url',
      render: (url) => (<Link target={"_blank"} title={url} href={url}><AiOutlineLine /></Link>)
    },
    {
      title: '操作',
      key: '_id',
      render: (_, record) => (
        <Space size="middle">
          <AiTwotoneEdit twoToneColor="red" onClick={() => {
            // editData(record);
          }} />
          {record.status === constant.RECORD.STATUS.DISCARD && (
            <AiTwotoneEdit twoToneColor="red" />
          )}
          {record.available === 1 ? <BsSendCheck /> : <BsSend />}
        </Space>
      ),
    },
  ]
  const getRecords = async () => {
    try {
      local.loading = true
      const result = await apis.getRecords({ page: local.page, limit: local.limit })
      if (result.code === 0) {
        local.records = result.data.items;
      } else {
        notification.error({ message: '获取数据失败' })
      }
    } finally {
      local.loading = false
    }
  }
  useEffectOnce(() => {
    getRecords()
  }, [])
  // return <div>title url status publish (tasks)</div>
  return <Observer>{() => (
    <Table columns={columns} loading={local.loading} dataSource={local.records} rowKey="_id" />
  )}</Observer>
}