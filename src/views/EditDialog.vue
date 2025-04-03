<template>
  <el-dialog :title="dialogTitle" v-model="visible" width="30%">

    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item :label="formLabel" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'EditDialog',
  props: {
    dialogTitle: { type: String, required: true },
    formLabel: { type: String, required: true },
    form: { type: Object, required: true },
    modelValue: { type: Boolean, required: true }, // v-model 对应的 prop
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const visible = ref(props.modelValue); // 双向绑定
    const formRef = ref(null);
    const formData = ref({ name: '' });
    const rules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    };

    // 同步父组件的 modelValue
    watch(
      () => props.modelValue,
      (newVal) => {
        visible.value = newVal;
      }
    );

    // 当 visible 变化时，通知父组件
    watch(visible, (newVal) => {
      emit('update:modelValue', newVal);
    });

    // 同步 form 数据
    watch(
      () => props.form,
      (newVal) => {
        formData.value = { ...newVal };
      },
      { immediate: true }
    );

    const save = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          emit('save', formData.value);
          visible.value = false; // 保存后关闭对话框
        }
      });
    };

    return {
      visible,
      formRef,
      formData,
      rules,
      save,
    };
  },
};
</script>