<template>
  <div class="viewItemFile">
    <el-drawer
      title="我是标题"
      :visible.sync="dialogVisible"
      :direction="direction"
      size="100%"
      :before-close="handleClose">

         <!-- pdf用嵌套的iframe -->
      <!-- <div v-if="fileRowData.type == 'pdf'">
        <iframe
          :src="pdfurl"
          type="application/x-google-chrome-pdf"
          width="100%"
          height="100%"
        />
      </div> -->
      <span>我来啦!{{fileRowData}}</span>
    </el-drawer>
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
     value: {
        type: Object,
        default: function () {
          return "";
        },
      },
  },
  data: function () {
    return {
      dialogVisible: false,
      direction: 'rtl',
      fileRowData: this.value,
    };
  },
    watch: {
      visible: {
        handler(newValue, oldValue) {
          console.log("newValue, oldValue",newValue, oldValue)
            if (newValue !== oldValue) {
              this.dialogVisible = true;
              // this.openFiletType(this.fileRowData)
            }
        },
        immediate: true,
      },

    },
  created: function () {
    //用于数据初始化

  },
  mounted: function () {
    console.log("value--",this.fileRowData)

  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    openFiletType(row) {
      //修改文件名称
      // let input = anno.getInput();
      // if(file.type === "pdf") {
      //     input.id = row.ID;
      //     let  url = "Anno.Plugs.Logic/KNDocument/GetDocumentModelById";
      //     anno.process(input, url, function (data) {
      //         console.log("打开->", data);
      //         if (data.status) {

      //         }
      //         that.$message(data.msg);
      //     });
      // }
    }
  },
};
</script>

<style  scoped>

</style>

