API 端点概述:

认证相关:

POST /api/auth/register - 注册新用户
POST /api/auth/login - 用户登录
Cookie池管理:

POST /api/pools - 创建新的cookie池
GET /api/pools - 获取可访问的cookie池列表
POST /api/pools/:id - 更新cookie池
POST /api/pools/:id - 删除cookie池
共享管理:

POST /api/shares/users/add - 添加共享用户
POST /api/shares/users/del - 移除共享用户
post /api/shares/users/list - 获取池的共享用户列表



  // "compatibility_flags": [
  //   "nodejs_compat"
  // ],
  // "vars": {
  //   "MY_VAR": "my-variable"
  // },
  // "kv_namespaces": [
  //   {
  //     "binding": "MY_KV_NAMESPACE",
  //     "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  //   }
  // ],
  // "r2_buckets": [
  //   {
  //     "binding": "MY_BUCKET",
  //     "bucket_name": "my-bucket"
  //   }
  // ],
  // "ai": {
  //   "binding": "AI"
  // },
  // "observability": {
  //   "enabled": true,
  //   "head_sampling_rate": 1
  // }