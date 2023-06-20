<template>
  <div class="home">
    <web-header v-show="false"></web-header>
    <!-- 预览 -->
    <ReportPreview :reportId="id" :hideSex="hideSex" @goback="goback" />
  </div>
</template>
<script>
import WebHeader from "@/components/header";
import ReportPreview from "@/components/Editor/ReportPreview";
export default {
  components: { ReportPreview,WebHeader },
  data() {
    return {
      id: this.$route.params.id,
      hideSex: this.$route.params.hideSex,
    };
  },
  created() {},
  mounted() {},
  methods: {
    goback() {
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss">
.home {
  height: 100vh;
}
</style>
