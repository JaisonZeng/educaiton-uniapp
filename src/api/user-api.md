# 用户头像上传和姓名修改后端对接方案

## 1. 接口总览

### 1.1 头像上传接口
- **URL**: `/api/user/upload-avatar`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authorization**: Bearer Token

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| avatar | File | 是 | 头像图片文件 |
| userId | String/Number | 是 | 用户ID |

#### 响应格式
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatarUrl": "https://your-domain.com/uploads/avatars/123456.jpg"
  }
}
```

### 1.2 更新用户信息接口
- **URL**: `/api/user/update`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authorization**: Bearer Token

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | String | 否 | 用户姓名 |
| avatar | String | 否 | 头像URL |

#### 响应格式
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 123,
    "name": "张三",
    "username": "zhangsan",
    "avatar": "https://your-domain.com/uploads/avatars/123456.jpg",
    "userType": 1
  }
}
```

## 2. 后端实现示例

### 2.1 Node.js + Express 实现

#### 头像上传接口
```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB限制
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 头像上传接口
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择头像文件'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // 更新用户头像信息
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
    
    res.json({
      code: 200,
      message: '头像上传成功',
      data: { avatarUrl }
    });
  } catch (error) {
    console.error('头像上传错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新用户信息接口
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 从token中获取用户ID
    const { name, avatar } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true }
    ).select('-password');
    
    res.json({
      code: 200,
      message: '用户信息更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
```

### 2.2 数据库模型示例
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  userType: { type: Number, enum: [1, 2, 3], default: 1 }, // 1:学生, 2:老师, 3:管理员
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

## 3. 前端配置

### 3.1 请求拦截器配置
在 `src/utils/request.js` 中添加：

```javascript
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = uni.getStorageSync('token');
    if (token) {
      config.header = config.header || {};
      config.header.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { code, message } = response.data;
    if (code === 401) {
      // token过期，清除本地存储并跳转登录
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.redirectTo({ url: '/pages/login/login' });
      return Promise.reject(new Error('登录已过期'));
    }
    return response;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);
```

### 3.2 环境变量配置
在 `src/config/index.js` 中配置：

```javascript
const config = {
  development: {
    baseURL: 'http://localhost:3000',
  },
  production: {
    baseURL: 'https://your-production-domain.com',
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

## 4. 错误处理

### 4.1 常见错误及处理
- **401 Unauthorized**: Token过期或无效，需要重新登录
- **413 Payload Too Large**: 文件大小超出限制，提示用户选择更小的图片
- **415 Unsupported Media Type**: 文件格式不支持，提示用户选择图片格式
- **500 Internal Server Error**: 服务器错误，提示用户稍后重试

### 4.2 前端错误提示
```javascript
const errorMessages = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  413: '图片太大，请选择2MB以内的图片',
  415: '请上传jpg、png或gif格式的图片',
  500: '服务器错误，请稍后重试',
  default: '操作失败，请稍后重试'
};
```

## 5. 安全考虑

1. **文件类型验证**: 只允许上传图片格式
2. **文件大小限制**: 限制在2MB以内
3. **文件名处理**: 使用唯一文件名防止覆盖
4. **权限验证**: 确保用户只能修改自己的信息
5. **Token验证**: 所有接口都需要有效的JWT token
6. **CORS配置**: 配置跨域访问
7. **HTTPS**: 生产环境使用HTTPS加密传输

## 6. 部署注意事项

1. 确保服务器有足够的存储空间
2. 配置CDN加速头像访问
3. 设置定期清理过期头像文件
4. 配置适当的缓存策略
5. 监控上传服务性能
6. 设置文件访问权限

## 7. 测试建议

### 7.1 单元测试
- 测试头像上传功能
- 测试用户信息更新功能
- 测试错误处理逻辑

### 7.2 集成测试
- 测试完整的头像更换流程
- 测试姓名修改流程
- 测试并发请求处理

### 7.3 性能测试
- 测试大文件上传
- 测试网络异常处理
- 测试服务器负载能力