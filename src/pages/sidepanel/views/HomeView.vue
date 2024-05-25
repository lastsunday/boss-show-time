<template>
  <el-row v-loading="loading">
    <el-col :span="8">
      <el-statistic title="今天浏览" :value="todayBrowseCount" />
    </el-col>
    <el-col :span="8">
      <el-statistic title="总浏览数" :value="totalBrowseCount" />
    </el-col>
    <el-col :span="8">
      <el-statistic title="总岗位数" :value="totalJobCount" />
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useTransition } from '@vueuse/core'
import { JobApi } from "@/api/index.js"

const todayBrowseCountSource = ref(0)
const totalBrowseCountSource = ref(0)
const totalJobCountSource = ref(0)
const todayBrowseCount = useTransition(todayBrowseCountSource, {
  duration: 1000,
})
const totalBrowseCount = useTransition(totalBrowseCountSource, {
  duration: 1000,
})

const totalJobCount = useTransition(totalJobCountSource, {
  duration: 1000,
})
const loading = ref(true)
const firstTimeLoading = ref(true);

onMounted(async ()=>{
  await refreshStatistic();
  setInterval(refreshStatistic,10000);
})

const refreshStatistic = async ()=>{
  if(firstTimeLoading.value){
    loading.value = true;
    firstTimeLoading.value = false;
  }
  const statisticJobBrowseDTO = await JobApi.statisticJobBrowse();
  todayBrowseCountSource.value = statisticJobBrowseDTO.todayBrowseCount ;
  totalBrowseCountSource.value = statisticJobBrowseDTO.totalBrowseCount;
  totalJobCountSource.value = statisticJobBrowseDTO.totalJob;
  loading.value = false; 
}

</script>



<style scoped>
.el-col {
  text-align: center;
}
</style>
