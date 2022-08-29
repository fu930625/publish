<template>
  <div class="viewItemFile">
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <span>这是一段信息</span>

    </el-dialog>
  </div>
</template>
<script>
module.exports = {
  props: {
    visible: {
      type: Number,
      default: 0,
    },
    openfile: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      dialogVisible: false,
    };
  },
    watch: {
      visible: {
        handler(newValue, oldValue) {

            if (newValue !== oldValue) {
              this.dialogVisible = true;
            }

        },
        immediate: true,
      },
    },
  created: function () {
    //用于数据初始化
  },
  mounted: function () {
    console.log("visible", this.visible);
  },
  methods: {},
};
</script>

<style  scoped>

</style>

