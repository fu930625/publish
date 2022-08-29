<template>
  <div class="viewItemFile">
    <el-drawer
      title="我是标题"
      :visible.sync="dialogVisible"
      :direction="direction"
      size="100%"
      :before-close="handleClose">

         <!-- pdf用嵌套的iframe -->
         <slot>

          <!-- <div v-if="fileRowData.extName == 'pdf'">
            11
            <iframe
              :src="pdfurl"
              type="application/x-google-chrome-pdf"
              width="100%"
              height="100%"
            />
          </div> -->
         </slot>
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
      pdfurl: ''
    };
  },
    watch: {
      visible: {
        handler(newValue, oldValue) {
          console.log("newValue, oldValue",newValue, oldValue)
            if (newValue !== oldValue) {
              this.dialogVisible = true;
              this.openFiletType(this.fileRowData)
            }
        },
        immediate: true,
      },
      value:{
         handler(newValue, oldValue) {
          this.fileRowData = newValue
        },
        immediate: true,
      }

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
      let input = anno.getInput();
      let param = {ID: row.ID}
      if(row.extName === "pdf") {
          input.doc = param;
          let url = "Anno.Plugs.Logic/KNDocument/GetDocumentModelById";
          anno.process(input, url, function (data) {
              console.log("打开->", data);
              if (data.status) {
              let blob = new Blob([res.data], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);
              
              this.pdfurl = url;

              }
          });
      }
    }
  },
};
</script>

<style  scoped>

</style>

