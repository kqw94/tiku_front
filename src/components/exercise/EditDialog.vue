<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="30%">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item :label="formLabel" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  formLabel: {
    type: String,
    required: true
  },
  initialForm: {
    type: Object,
    default: () => ({ id: null, name: '' })
  }
});

const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(props.visible);
const form = ref({ ...props.initialForm });
const formRef = ref(null);

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
};

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
});

watch(() => dialogVisible.value, (newVal) => {
  emit('update:visible', newVal);
});

watch(() => props.initialForm, (newVal) => {
  form.value = { ...newVal };
}, { deep: true });

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleSave = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('save', form.value);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script> 