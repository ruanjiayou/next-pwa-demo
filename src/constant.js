const root_path = process.cwd();

export default {
  RECORD: {
    STATUS: {
      // 已创建
      CREATED: 1,
      // 处理中
      DEALING: 2,
      // 已完成
      SUCCESS: 3,
      // 出错了
      ERRORED: 4,
      // 已停止
      STOPPED: 5,
    },
    UPDATE_STATUS: {
      UPDATING: 1,
      FINISHED: 0,
    }
  },
  RULE: {
    STATUS: {
      CREATED: 0,
      RUNNING: 1,
      DISCARD: 2,
      WAITING: 3,
    }
  },
  ATTACHMENT: {
    STATUS: {
      CREATED: 1,
      DOWNLOADING: 2,
      TRANSCODING: 3,
      SUCCESS: 4,
      ERRORED: 5,
    }
  },
  VIDEO: {
    // 正片: feature 预告片: trailer 花絮: tidbits 短视频: short 一般短片 video
    TYPE: {
      FEATURE: 1,
      TRAILER: 2,
      TIDBITS: 3,
      SHORT: 4,
      VIDEO: 5,
    }
  },

  // 项目路径
  'ROOT_PATH': root_path,
  // 约定目录
  // 应用程序路径,固定写src,想根据NODE_ENV改也可以
  'APP_PATH': `${root_path}/src`,
  // 配置文件路径
  'CONFIG_PATH': `${root_path}/config`,
  // 静态文件路径
  'STATIC_PATH': `${root_path}/static`,
  // 上传文件夹路径
  'UPLOAD_PATH': `${root_path}/upload`,
  // 日志文件路径
  'LOG_PATH': `${root_path}/logs`,
  // 业务错误码路径
  'ERRORS_CODE_PATH': `${root_path}/src/errors-code`,

  // 约定名称
  // 请求约定字段
  'REQ_PAGE': 'page',
  'REQ_LIMIT': 'limit',
  'REQ_SEARCH': 'q',
  'REQ_ORDER': 'order',
  // 约定返回字段
  'RES_CODE': 'code',
  'RES_DATA': 'data',
  'RES_DESC': 'desc',
  'RES_MESSAGE': 'message',
  'RES_STACK': 'stack',
  'RES_FAIL': -1,
  // 约定分页字段
  'RES_PAGER': 'pager',
  'RES_PAGER_PAGE': 'page',
  'RES_PAGER_LIMIT': 'limit',
  'RES_PAGER_TOTAL': 'total',
}