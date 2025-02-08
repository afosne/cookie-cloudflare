API 端点概述:

认证相关:

POST /api/auth/register - 注册新用户
POST /api/auth/login - 用户登录
GET /api/auth/me - 获取用户信息
Cookie池管理:

POST /api/pools - 创建新的cookie池
GET /api/pools - 获取可访问的cookie池列表
POST /api/pools/put - 更新cookie池
POST /api/pools/del - 删除cookie池
共享管理:

POST /api/shares/users/add - 添加共享用户
POST /api/shares/users/del - 移除共享用户
post /api/shares/users/list - 获取池的共享用户列表
