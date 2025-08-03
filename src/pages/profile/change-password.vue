<template>
  <view class="change-password-container">
    <view class="form-container">
      <view class="form-item">
        <text class="label">原密码</text>
        <input 
          v-model="form.oldPassword" 
          type="password" 
          placeholder="请输入原密码"
          class="input"
          password
        />
      </view>
      
      <view class="form-item">
        <text class="label">新密码</text>
        <input 
          v-model="form.newPassword" 
          type="password" 
          placeholder="请输入新密码"
          class="input"
          password
        />
      </view>
      
      <view class="form-item">
        <text class="label">确认新密码</text>
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="请再次输入新密码"
          class="input"
          password
          @confirm="handleSubmit"
        />
      </view>
      
      <button class="submit-btn" @click="handleSubmit">确认修改</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/utils/request';
import { useStore } from 'vuex';

const store = useStore();
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const validateForm = () => {
  if (!form.value.oldPassword) {
    uni.showToast({ title: '请输入原密码', icon: 'none' });
    return false;
  }
  
  if (!form.value.newPassword) {
    uni.showToast({ title: '请输入新密码', icon: 'none' });
    return false;
  }
  
  if (form.value.newPassword.length < 6) {
    uni.showToast({ title: '密码长度不能少于6位', icon: 'none' });
    return false;
  }
  
  if (form.value.newPassword !== form.value.confirmPassword) {
    uni.showToast({ title: '两次输入的新密码不一致', icon: 'none' });
    return false;
  }
  
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    uni.showLoading({ title: '修改中...' });
    
    await api.changePassword({
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    });
    
    uni.hideLoading();
    
    uni.showToast({
      title: '密码修改成功',
      icon: 'success',
      success: () => {
        // 清空表单
        form.value = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    });
    
  } catch (error: any) {
    console.error('修改密码失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.data.message || '修改失败，请稍后重试',
      icon: 'none'
    });
  }
};
</script>

<style lang="scss" scoped>
.change-password-container {
  padding: 30rpx;
  min-height: 100vh;
  background-color: #f7f7f7;
}

.form-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 40rpx;
  
  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }
  
  .input {
    height: 88rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    
    &::placeholder {
      color: #999;
    }
  }
}

.submit-btn {
  margin-top: 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: linear-gradient(135deg, #92a4f3 0%, #b982ef 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  
  &:active {
    opacity: 0.9;
  }
  
  &[disabled] {
    background: #ccc;
    color: #fff;
  }
}
</style>
