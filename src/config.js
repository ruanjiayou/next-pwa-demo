export default {
  'PORT': '8099',
  'mongo': {
    'user': 'root',
    'pass': '123456',
    'host': '127.0.0.1',
    'port': '27017',
    'db': 'crawler',
  },
  // 跨域
  'CORS': {
    'origins': '*',
    'headers': ['X-Token']
  },

  // 多语言
  'i18n': {
    'langs': ['en-us', 'zh-cn'],
    'default': 'zh-cn'
  },

  // 上传
  'UPLOAD': {
    'fileSize': '10mb',
    'fields': 100,
    'fieldNameSize': 255
  },

  // 系统基本信息
  'SYSTEM': {
    'language': 'nodejs',
    'title': '项目'
  },
  'PROJECT_NAME': 'demo'
};
