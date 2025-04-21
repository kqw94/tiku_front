<!-- src/components/ExerciseFilter.vue -->
<template>
  <div class="exercise-filter">
    <h3>题目筛选</h3>
    <el-collapse v-model="activePanels" accordion>
      <el-collapse-item title="搜索" name="search">
        <el-form label-position="top">
          <el-form-item label="搜索类型">
            <el-select v-model="filters.search_type" placeholder="搜索类型" size="small" style="width: 100%;">
              <el-option label="ID" value="id" />
              <el-option label="内容" value="content" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="filters.search" placeholder="请输入搜索关键词" size="small" />
          </el-form-item>
        </el-form>
      </el-collapse-item>

      <el-collapse-item title="章节目录" name="category">
        <el-form label-position="top">
          <el-form-item label="专业">
            <el-select v-model="filters.category_id" placeholder="选择类别" size="small" clearable @change="fetchMajors">
              <el-option v-for="item in categories" :key="item.category_id" :label="item.category_name" :value="item.category_id" />
            </el-select>
          </el-form-item>
          <el-form-item label="科目">
            <el-select v-model="filters.major_id" placeholder="选择专业" size="small" clearable @change="fetchChapters">
              <el-option v-for="item in majors" :key="item.major_id" :label="item.major_name" :value="item.major_id" />
            </el-select>
          </el-form-item>
          <el-form-item label="章节">
            <el-select v-model="filters.chapter_id" placeholder="选择章节" size="small" clearable @change="fetchExamGroups">
              <el-option v-for="item in chapters" :key="item.chapter_id" :label="item.chapter_name" :value="item.chapter_id" />
            </el-select>
          </el-form-item>
          <el-form-item label="考点">
            <el-select v-model="filters.examgroup_id" placeholder="选择考试组" size="small" clearable>
              <el-option v-for="item in examGroups" :key="item.examgroup_id" :label="item.examgroup_name" :value="item.examgroup_id" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-collapse-item>

      <el-collapse-item title="院校真题" name="exam">
        <el-form label-position="top">
          <el-form-item label="学校">
            <el-select v-model="filters.exam_school" placeholder="选择学校" size="small" clearable @change="fetchExamTimes">
              <el-option v-for="item in examSchools" :key="item.name" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试时间">
            <el-select v-model="filters.exam_time" placeholder="选择考试时间" size="small" clearable @change="fetchExamCodes">
              <el-option v-for="item in examTimes" :key="item.name" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试代码">
            <el-select v-model="filters.exam_code" placeholder="选择考试代码" size="small" clearable @change="fetchExamFullNames">
              <el-option v-for="item in examCodes" :key="item.name" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试全名">
            <el-select v-model="filters.exam_full_name" placeholder="选择考试全名" size="small" clearable>
              <el-option v-for="item in examFullNames" :key="item.name" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-collapse-item>

      <el-collapse-item title="题目属性" name="attributes">
        <el-form label-position="top">
          <el-form-item label="题型">
            <el-select v-model="filters.exercise_type" placeholder="选择题型" size="small" clearable @change="markChanged('exercise_type')">
              <el-option v-for="item in exerciseTypes" :key="item.type_id" :label="item.type_name" :value="item.type_id" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源">
            <el-select v-model="filters.source" placeholder="选择来源" size="small" clearable @change="markChanged('source')">
              <el-option v-for="item in sources" :key="item.source_id" :label="item.source_name" :value="item.source_id" />
            </el-select>
          </el-form-item>
          <el-form-item label="难度">
            <el-slider v-model="filters.level" :min="1" :max="5" show-stops @change="markChanged('level')" />
          </el-form-item>
          <el-form-item label="分数">
            <div class="score-range">
              <el-input-number v-model="filters.score_min" :min="0" :max="100" placeholder="最低分" size="small" @change="markChanged('score_min')" />
              <span class="score-divider"> - </span>
              <el-input-number v-model="filters.score_max" :min="0" :max="100" placeholder="最高分" size="small" @change="markChanged('score_max')" />
            </div>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <el-collapse-item title="答案对比" name="answer_comparison">
    <el-form label-position="top">
      <div v-for="(condition, index) in answerConditions" :key="index" class="condition-group">
        <div class="condition-header">
          <span>对比条件 {{ index + 1 }}</span>
          <span class="delete-icon" @click="removeCondition(index)">×</span>
        </div>
        <el-form-item label="第一个答案">
          <el-select
            v-model="condition.index1"
            placeholder="选择第一个答案"
            size="small"
            style="width: 100%;"
            @change="markChanged('answer_comparison')"
          >
            <el-option
              v-for="n in 5"
              :key="n"
              :label="`第 ${n} 个答案`"
              :value="n"
              :disabled="condition.index2 === n"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="第二个答案">
          <el-select
            v-model="condition.index2"
            placeholder="选择第二个答案"
            size="small"
            style="width: 100%;"
            @change="markChanged('answer_comparison')"
          >
            <el-option
              v-for="n in 5"
              :key="n"
              :label="`第 ${n} 个答案`"
              :value="n"
              :disabled="condition.index1 === n"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="对比方式">
          <el-select
            v-model="condition.operator"
            placeholder="选择对比方式"
            size="small"
            style="width: 100%;"
            @change="markChanged('answer_comparison')"
          >
            <el-option label="相等" value="equal" />
            <el-option label="不相等" value="not_equal" />
          </el-select>
        </el-form-item>
      </div>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="addCondition"
        >
          添加对比条件
        </el-button>
      </el-form-item>
    </el-form>
  </el-collapse-item>

      <!-- 答案对比筛选：垂直排列 -->
     
    </el-collapse>

    <div class="actions">
      <el-button type="primary" size="small" @click="applyFilters">执行筛选</el-button>
      <el-button size="small" @click="resetFilters">重置</el-button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'ExerciseFilter',
  emits: ['filter-changed'],
  setup() {
    const activePanels = ref('search');
    const filters = ref({
      search: '',
      search_type: 'id',
      category_id: null,
      major_id: null,
      chapter_id: null,
      examgroup_id: null,
      exercise_type: null,
      source: null,
      level: 1,
      score_min: null,
      score_max: null,
      exam_school: null,
      exam_time: null,
      exam_code: null,
      exam_full_name: null,
      answer_comparison: null,
    });
    const changedFields = ref({
      exercise_type: false,
      source: false,
      level: false,
      score_min: false,
      score_max: false,
      exam_school: false,
      exam_time: false,
      exam_code: false,
      exam_full_name: false,
      answer_comparison: false,
    });

    // 答案对比条件
    const answerConditions = ref([
      { index1: null, index2: null, operator: 'equal' }, // 默认一个条件
    ]);

    const categories = ref([]);
    const majors = ref([]);
    const chapters = ref([]);
    const examGroups = ref([]);
    const exerciseTypes = ref([]);
    const sources = ref([]);
    const examSchools = ref([]);
    const examTimes = ref([]);
    const examCodes = ref([]);
    const examFullNames = ref([]);

    const fetchOptions = async () => {
      try {
        const responses = await Promise.all([
          axios.get('/categories/'),
          axios.get('/exercise-types/'),
          axios.get('/sources/'),
          axios.get('/exam-schools/'),
        ]);
        categories.value = responses[0].data.results || responses[0].data;
        exerciseTypes.value = responses[1].data;
        sources.value = responses[2].data;
        examSchools.value = responses[3].data;
      } catch (error) {
        console.error('Failed to fetch initial options:', error);
      }
    };

    fetchOptions();

    return {
      activePanels,
      filters,
      changedFields,
      answerConditions,
      categories,
      majors,
      chapters,
      examGroups,
      exerciseTypes,
      sources,
      examSchools,
      examTimes,
      examCodes,
      examFullNames,
      fetchOptions,
    };
  },
  methods: {
    fetchMajors() {
      if (this.filters.category_id) {
        axios
          .get(`/majors/${this.filters.category_id}/`)
          .then(response => {
            this.majors = response.data.results || response.data;
            this.filters.major_id = null;
            this.chapters = [];
            this.examGroups = [];
          })
          .catch(error => {
            console.error('Failed to fetch majors:', error);
            this.majors = [];
          });
      } else {
        this.majors = [];
      }
    },
    fetchChapters() {
      if (this.filters.major_id) {
        axios
          .get(`/chapters/${this.filters.major_id}/`)
          .then(response => {
            this.chapters = response.data.results || response.data;
            this.filters.chapter_id = null;
            this.examGroups = [];
          })
          .catch(error => {
            console.error('Failed to fetch chapters:', error);
            this.chapters = [];
          });
      } else {
        this.chapters = [];
      }
    },
    fetchExamGroups() {
      if (this.filters.chapter_id) {
        axios
          .get(`/examgroups/${this.filters.chapter_id}/`)
          .then(response => {
            this.examGroups = response.data.results || response.data;
            this.filters.examgroup_id = null;
          })
          .catch(error => {
            console.error('Failed to fetch exam groups:', error);
            this.examGroups = [];
          });
      } else {
        this.examGroups = [];
      }
    },
    fetchExamTimes() {
      this.markChanged('exam_school');
      if (this.filters.exam_school) {
        axios
          .get(`/exam-times/${encodeURIComponent(this.filters.exam_school)}/`)
          .then(response => {
            this.examTimes = response.data;
            this.filters.exam_time = null;
            this.examCodes = [];
            this.examFullNames = [];
          })
          .catch(error => {
            console.error('Failed to fetch exam times:', error);
            this.examTimes = [];
          });
      } else {
        this.examTimes = [];
      }
    },
    fetchExamCodes() {
      this.markChanged('exam_time');
      if (this.filters.exam_school && this.filters.exam_time) {
        axios
          .get(`/exam-codes/${encodeURIComponent(this.filters.exam_school)}/${encodeURIComponent(this.filters.exam_time)}/`)
          .then(response => {
            this.examCodes = response.data;
            this.filters.exam_code = null;
            this.examFullNames = [];
          })
          .catch(error => {
            console.error('Failed to fetch exam codes:', error);
            this.examCodes = [];
          });
      } else {
        this.examCodes = [];
      }
    },
    fetchExamFullNames() {
      this.markChanged('exam_code');
      if (this.filters.exam_school && this.filters.exam_time && this.filters.exam_code) {
        axios
          .get(`/exam-full-names/${encodeURIComponent(this.filters.exam_school)}/${encodeURIComponent(this.filters.exam_time)}/${encodeURIComponent(this.filters.exam_code)}/`)
          .then(response => {
            this.examFullNames = response.data;
            this.filters.exam_full_name = null;
          })
          .catch(error => {
            console.error('Failed to fetch exam full names:', error);
            this.examFullNames = [];
          });
      } else {
        this.examFullNames = [];
      }
    },
    markChanged(field) {
      this.changedFields[field] = true;
    },
    addCondition() {
      if (this.answerConditions.length >= 3) {
        this.$message.warning('最多支持 3 组对比条件');
        return;
      }
      this.answerConditions.push({ index1: null, index2: null, operator: 'equal' });
      this.markChanged('answer_comparison');
    },
    removeCondition(index) {
      this.answerConditions.splice(index, 1);
      if (this.answerConditions.length === 0) {
        this.answerConditions.push({ index1: null, index2: null, operator: 'equal' });
      }
      this.markChanged('answer_comparison');
    },
    applyFilters() {
      const filterParams = {
        search: this.filters.search,
        search_type: this.filters.search_type,
        category_id: this.filters.category_id,
        major_id: this.filters.major_id,
        chapter_id: this.filters.chapter_id,
        examgroup_id: this.filters.examgroup_id,
      };

      if (this.changedFields.exercise_type) filterParams.exercise_type = this.filters.exercise_type;
      if (this.changedFields.source) filterParams.source = this.filters.source;
      if (this.changedFields.level) filterParams.level = this.filters.level;
      if (this.changedFields.score_min) filterParams.score_min = this.filters.score_min;
      if (this.changedFields.score_max) filterParams.score_max = this.filters.score_max;
      if (this.changedFields.exam_school) filterParams.exam_school = this.filters.exam_school;
      if (this.changedFields.exam_time) filterParams.exam_time = this.filters.exam_time;
      if (this.changedFields.exam_code) filterParams.exam_code = this.filters.exam_code;
      if (this.changedFields.exam_full_name) filterParams.exam_full_name = this.filters.exam_full_name;

      // 处理答案对比条件
      if (this.changedFields.answer_comparison) {
        const validConditions = this.answerConditions.filter(
          condition => condition.index1 && condition.index2 && condition.operator
        );
        if (validConditions.length > 0) {
          filterParams.answer_comparison = JSON.stringify(validConditions);
        }
      }

      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === null || filterParams[key] === '' || filterParams[key] === undefined) {
          delete filterParams[key];
        }
      });

      this.$emit('filter-changed', filterParams);
    },
    resetFilters() {
      this.filters.search = '';
      this.filters.search_type = 'id';
      this.filters.category_id = null;
      this.filters.major_id = null;
      this.filters.chapter_id = null;
      this.filters.examgroup_id = null;
      this.filters.exercise_type = null;
      this.filters.source = null;
      this.filters.level = 1;
      this.filters.score_min = null;
      this.filters.score_max = null;
      this.filters.exam_school = null;
      this.filters.exam_time = null;
      this.filters.exam_code = null;
      this.filters.exam_full_name = null;
      this.filters.answer_comparison = null;

      this.changedFields.exercise_type = false;
      this.changedFields.source = false;
      this.changedFields.level = false;
      this.changedFields.score_min = false;
      this.changedFields.score_max = false;
      this.changedFields.exam_school = false;
      this.changedFields.exam_time = false;
      this.changedFields.exam_code = false;
      this.changedFields.exam_full_name = false;
      this.changedFields.answer_comparison = false;

      this.majors = [];
      this.chapters = [];
      this.examGroups = [];
      this.examTimes = [];
      this.examCodes = [];
      this.examFullNames = [];
      this.answerConditions = [{ index1: null, index2: null, operator: 'equal' }];
    },
  },
};
</script>

<style scoped>
.exercise-filter {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.el-collapse {
  flex: 1;
  overflow-y: auto;
  border: none;
}

.el-collapse-item__header {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
  background-color: #f9fafc;
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
}

.el-form-item {
  margin-bottom: 10px;
}

.actions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e6e6e6;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.score-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-divider {
  color: #606266;
  font-size: 14px;
}

.condition-group {
  border-top: 1px solid #e6e6e6;
  padding-top: 10px;
  margin-bottom: 10px;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.delete-icon {
  cursor: pointer;
  font-size: 16px;
  color: #f56c6c; /* Element Plus 红色 */
  line-height: 1;
  transition: color 0.2s;
}

.delete-icon:hover {
  color: #f78989; /* 悬停时略浅 */
}


</style>