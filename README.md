API 端点概述:

认证相关:

POST /api/auth/register - 注册新用户
curl -X POST 'http://127.0.0.1:8787/api/auth/register' -H 'Content-Type: application/json' -d '{
  "username":"afosne",
  "password":"Sunshine08."
}'
{
  "message": "User registered successfully",
  "success": true
}
POST /api/auth/login - 用户登录
curl -X POST 'http://127.0.0.1:8787/api/auth/login' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36' -H 'Accept: application/json, text/event-stream' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.kr3XkLl-FZxTcuoE4flUjkln43HbiT1iGTDt7eqBw2I' -d '{
  "username":"test",
  "password":"test123"
}'
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4",
  "user": {
    "id": 2,
    "username": "test",
    "role": "user"
  }
}
GET /api/auth/me - 获取用户信息
curl -X GET 'http://127.0.0.1:8787/api/auth/me' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4'
Cookie池管理:

POST /api/pools/create - 创建新的cookie池
curl -X POST 'http://127.0.0.1:8787/api/pools' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4' -H 'Content-Type: application/json' -d '{
  "name": "testname",
  "domain":"netflix.com",
  "cookies": "testcookie",
  "isPublic": "0"
}'
{
  "message": "数据创建成功"
}
POST /api/pools/get - 获取可访问的cookie池列表
curl -X POST 'http://127.0.0.1:8787/api/pools/get' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZm9zbmUiLCJyb2xlIjoiYWRtaW4ifQ.hxPoa2ilaUZ3tu0iwk68yVasM2kYg-_61OAl8icDMkE' -H 'Content-Type: application/json' -d '{
  "domain":"netflix.com"
}'
{
  "success": true,
  "meta": {
    "served_by": "miniflare.db",
    "duration": 0,
    "changes": 0,
    "last_row_id": 0,
    "changed_db": false,
    "size_after": 28672,
    "rows_read": 5,
    "rows_written": 0
  },
  "results": [
    {
      "id": 1,
      "name": "testname",
      "domain": "netflix.com",
      "cookies": "testcookie",
      "owner_id": 2,
      "is_public": 1,
      "created_at": "2025-02-08 08:10:49",
      "updated_at": "2025-02-08 08:10:49"
    },
    {
      "id": 6,
      "name": "testname",
      "domain": "netflix.com",
      "cookies": "testcookie",
      "owner_id": 2,
      "is_public": 0,
      "created_at": "2025-02-08 16:19:21",
      "updated_at": "2025-02-08 16:19:21"
    },
    {
      "id": 7,
      "name": "testname",
      "domain": "netflix.com",
      "cookies": "testcookie",
      "owner_id": 2,
      "is_public": 0,
      "created_at": "2025-02-08 16:19:21",
      "updated_at": "2025-02-08 16:19:21"
    }
  ]
}
POST /api/pools/getone - 获取该域名可访问的cookie池列表
curl -X POST 'http://127.0.0.1:8787/api/pools/get' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZm9zbmUiLCJyb2xlIjoiYWRtaW4ifQ.hxPoa2ilaUZ3tu0iwk68yVasM2kYg-_61OAl8icDMkE' -H 'Content-Type: application/json' -d '{
  "domain":"netflix.com"
}'
{
  "id": 9,
  "name": "testname",
  "domain": "netflix.com",
  "cookies": "\"testcookie\"",
  "owner_id": 2,
  "is_public": 0,
  "created_at": "2025-02-09 07:14:18",
  "updated_at": "2025-02-09 07:14:18"
}
POST /api/pools/put - 更新cookie池
curl -X POST 'http://127.0.0.1:8787/api/pools/put' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4' -H 'Content-Type: application/json' -d '{
  "poolId":6,
  "name": "testname",
  "domain":"netflix.com",
  "cookies": "testcookie",
  "isPublic": "0"
}'
{
  "message": "更新数据成功"
}
POST /api/pools/del - 删除cookie池
curl -X POST 'http://127.0.0.1:8787/api/pools/del' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4' -H 'Content-Type: application/json' -d '{
  "poolId": 6
}'
{
  "message": "删除数据成功"
}
共享管理:

POST /api/shares/users/add - 添加共享用户
curl -X POST 'http://127.0.0.1:8787/api/shares/users/add' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4' -H 'Content-Type: application/json' -d '{
  "poolId": "3",
  "userId": "3"
}'
{
  "message": "创建分享用户成功"
}
POST /api/shares/users/del - 移除共享用户
curl -X POST 'http://127.0.0.1:8787/api/shares/users/del' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4' -H 'Content-Type: application/json' -d '{
  "poolId": "3",
  "userId": "3"
}'
{
  "message": "删除分享用户成功"
}
post /api/shares/users/list - 获取池的共享用户列表
curl -X POST 'http://127.0.0.1:8787/api/shares/users/list' -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6InVzZXIifQ.TESKm8EawWNpgsphtEFhbupcTPCM2rGq1m98UyWzlq4' -H 'Content-Type: application/json' -d '{
  "poolId":3
}'
{
  "success": true,
  "meta": {
    "served_by": "miniflare.db",
    "duration": 0,
    "changes": 0,
    "last_row_id": 0,
    "changed_db": false,
    "size_after": 28672,
    "rows_read": 2,
    "rows_written": 0
  },
  "results": [
    {
      "id": 3,
      "username": "test1"
    }
  ]
}
