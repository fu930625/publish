<template>
  <div class="viewItemFile">
        <el-drawer
            title="我是标题"
            :visible.sync="dialogVisible"
            size="100%"
            :direction="direction"
            :before-close="handleClose"
            >
              <div class="open-file">
                  <iframe
                  v-if="fileRowData.extName === 'pdf'"
                  width="100%"
                  height="100%"
                  :src="pdfurl"
                  type="application/x-google-chrome-pdf"
                  >
                  </iframe>
              </div>
             <div ref="file" class="file_class"></div>
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
      pdfurl: '',
      errurl: ''
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
      let that = this;
      let input = anno.getInput();
      let param = "{ID: "+row.ID+"}";
      input.doc = param;
      let url = "Anno.Plugs.Logic/KNDocument/GetDocumentModelById";
      let type = '';
      if(row.extName) {
        type = 'blob'
      } else {
        type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
      anno.process_blob(input, url, function (data) {
          if (data.status) {
            let res = data.outputData;
            if(row.extName === "pdf") {
              const blob = that.base64ToBlob(res.Content,'application/pdf')
              if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob)
              } else {
                const fileURL = URL.createObjectURL(blob);
                 console.log("fileURL",fileURL)
                that.pdfurl = fileURL
                // window.open(fileURL)
              }
            } else {
              const blob = that.base64ToBlob(res.Content,'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
              const fileURL = URL.createObjectURL(blob)
                that.$nextTick(() => {
                  docx.renderAsync(blob, that.$refs.file);
                })
            }
          }
      });
    },

    // 通过base64解析打开文件
     base64ToBlob(code, type) {
      code = code.replace(/[\n\r]/g, '')
      // atob() 方法用于解码使用 base-64 编码的字符串。
      const raw = window.atob(code)
      const rawLength = raw.length
      const uInt8Array = new Uint8Array(rawLength)
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i)
      }
      return new Blob([uInt8Array], { type: type })
    },

  },
};
</script>

<style  scoped>
.open-file {
  height: 100%;
}
</style>

