<template>
  <div>
      <el-form ref="elForm"
               :model="formData"
               :rules="rules"
               size="mini"
               label-width="100px"
               label-position="right">
          <!--<el-upload action="" :http-request="onUpload" accept="text/plain, application/pdf">
        <el-button size="small" type="primary">点击上传</el-button>
    </el-upload>-->
          <el-card>
              <div slot="header" class="clearfix">
                  <span>选择文件夹</span>
              </div>
              <el-tree ref="refTree"
                       :data="folderData"
                       :props="{ label: 'name' }"
                       :default-expand-all="true"
                       :show-checkbox="true"
                       :check-strictly="true"
                       node-key="id" />
          </el-card>
          <el-card>
              <div slot="header" class="clearfix">
                  <span>上传文档</span>
              </div>

              <el-upload action=""
                         accept=".txt, .pdf, .doc, .docx, .xls, .xlsx"
                         :before-upload="onBeforeUpload"
                         multiple
                         :limit="3"
                         :file-list="fileList"
                         :on-exceed="handleExceed"
                         :on-change="onUploadChange"
                         :auto-upload="false"
                         :show-file-list="true">
                  <el-button slot="trigger" size="small" type="primary">选取</el-button>
                  <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传</el-button>
                  <div slot="tip" class="el-upload__tip">可上传大小：5M以内</div>
                  <div slot="tip" class="el-upload__tip">可上传文件格式：*.txt, *.pdf, *.doc, *.docx, *.xls, *.xlsx</div>
              </el-upload>

              <!--<el-row>
                  <el-col :span="span">
                      <el-form-item label="用户：" prop="name">
                          <el-input v-model="formData.name"
                                    placeholder="请输入用户"
                                    clearable
                                    :style="{ width: '100%' }">
                          </el-input>
                      </el-form-item>
                  </el-col>
                  <el-col :span="span">
                      <el-form-item label="登录名：" prop="account">
                          <el-input v-model="formData.account"
                                    placeholder="请输入登录名"
                                    clearable
                                    :style="{ width: '100%' }">
                          </el-input>
                      </el-form-item>
                  </el-col>
                  <el-col :span="span">
                      <el-form-item label="职位：" prop="position">
                          <el-input v-model="formData.position"
                                    placeholder="请输入职位"
                                    clearable
                                    :style="{ width: '100%' }">
                          </el-input>
                      </el-form-item>
                  </el-col>
              </el-row>
              <el-row>
                  <el-col :span="span">
                      <el-form-item label="状态：" prop="state">
                          <el-select v-model="formData.state"
                                     :style="{ width: '100%' }"
                                     placeholder="请选择">
                              <el-option v-for="item in stateOptions"
                                         :key="item.value"
                                         :label="item.label"
                                         :value="item.value">
                              </el-option>
                          </el-select>
                      </el-form-item>
                  </el-col>
                  <el-col :span="span">
                      <el-form-item label="密码：" prop="pwd">
                          <el-input show-password
                                    v-model="formData.pwd"
                                    placeholder="请输入密码："
                                    clearable
                                    :style="{ width: '100%' }">
                          </el-input>
                      </el-form-item>
                  </el-col>
              </el-row>-->
          </el-card>
          <!--<el-form-item size="mini" style="text-align: center">
              <el-button type="primary" @click="submitForm">提交</el-button>
              <el-button @click="resetForm">重置</el-button>
          </el-form-item>-->
          <el-table :data="roleData"
                    ref="roleDataTable"
                    stripe
                    @selection-change="handleSelectionChange"
                    size="mini"
                    border style="width: 100%">
              <el-table-column type="selection" width="55"> </el-table-column>
              <el-table-column prop="ID" label="角色编号" width="200">
              </el-table-column>
              <el-table-column prop="name" label="角色"> </el-table-column>
          </el-table>
      </el-form>
  </div>
</template>

<script>
    module.exports = {
        data: function () {
            return {
                span: 8,
                folderData: [],
                fileList: [],
                formData: {
                    DocName: "",
                    ExtName: "",
                    Size: "",
                    Path: "1",
                    UploaderID: "",
                    UploaderName: "",
                    DocState: "",
                    SecLevel: "",
                    file: null
                },
                stateOptions: [
                    {
                        value: "0",
                        label: "禁用"
                    },
                    {
                        value: "1",
                        label: "启用"
                    }
                ],
                rules: {
                    name: [
                        {
                            required: true,
                            message: "请输入用户名",
                            trigger: "blur",
                        }
                    ],
                    account: [
                        {
                            required: true,
                            message: "请输入登录名",
                            trigger: "blur",
                        }
                    ],
                    state: [
                        {
                            required: true,
                            message: "请选择状态",
                            trigger: "blur",
                        }
                    ],
                    pwd: [
                        {
                            required: true,
                            message: "请输入密码",
                            trigger: "blur",
                        }
                    ]
                },
                roleDataTable: []
            };
        },
        created: function () {
            if (this.isMobile() === true) {
                this.span = 23;
            }
            //用于数据初始化
            document.title = "新增文档";
            //this.getRoleData();
            this.keyupAnno();
        },
        methods: {
            onBeforeUpload: function (file) {
                console.log("onBeforeUpload");
                const FIVE_M = 5 * 1024 * 1024;
                const accept = ".txt, .pdf, .doc, .docx, .xls, .xlsx";
                if (accept.indexOf(this.formData.ExtName) < 0) {
                    this.$message.error("不支持的文件类型");
                    return false;
                }
                if (file.size > FIVE_M) {
                    this.$message.error("文件大小不能超过5M'");
                    return false;
                }

                return true;
            },
            handleExceed: function (files, fileList) {
                //this.$notify.warning({
                //    title: '警告',
                //    message: '最多上传3个文件'
                //});
                this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)

                return;
            },
            handleRemove(file) {  //删除文件
                if (file && file.status == 'success') {
                    const fu = file.uid
                    const num = this.fileList.findIndex(value => value.uid === fu)
                    this.fileList.splice(num, 1)
                    this.upImgToString()
                }
            },
            onUploadChange: function (file) {
                console.log("onUploadChange");
                //debugger;
                //let upFile = file.file
                this.formData.file = file;
                this.formData.DocName = file.name;
                this.formData.ExtName = file.name.replace(/.+\./, "");
                this.formData.Size = file.size;
                console.log(this.formData);

                let accept = ".txt, .pdf, .doc, .docx, .xls, .xlsx";
                if (accept.indexOf(this.formData.ExtName) < 0) {
                    this.$notify.warning({
                        title: '警告',
                        message: '不支持的文件类型'
                    });
                    this.fileList.pop();
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                    this.$notify.warning({
                        title: '警告',
                        message: '文件大小不能超过5M'
                    });
                    this.fileList.pop();
                    return false;
                }
            },
            onUpload: function (file) {
                //let formData = new FormData()
                //formData.append('file', file.file)
                debugger;
                let upFile = file.file
                this.formData.file = upFile;
                this.formData.DocName = upFile.name;
                this.formData.ExtName = upFile.name.replace(/.+\./, "");
                this.formData.Size = upFile.size;
                console.log(this.formData.DocName)
                console.log(this.formData.ExtName)
                //this.postUpload(formData).then((res) => {
                //    console.log(res)
                //    this.$message.success(this.$t('UPLOAD_SUCCESS'))
                //}).catch((e) => {
                //    this.$message.error(e.message)
                //})
            },
            submitUpload: function () {

            },
            postUpload: function (file) {
                return axios({
                    url: 'upload',
                    method: 'post',
                    data: file,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
            },
            getFolderData: function () {
                var that = this;
                var input = anno.getInput();
                input.uid = -1;
                anno.process(input, "Anno.Plugs.Logic/KNDocument/GetUserFolders", function (data) {
                    if (data.status === true) {
                        that.folderData = data.outputData.lr;
                    } else {
                        that.$message.error("获取角色：" + data.msg);
                    }
                });
            },
            submitForm: function () {
                var that = this;
                this.$refs["elForm"].validate(function (valid) {
                    if (!valid) return;
                    //if(that.roleDataTable.length<=0){
                    //   that.$message.error("至少选择一个角色");
                    //  return;
                    //}
                    that.addDocument();
                });
            },
            resetForm: function () {
                this.$refs["elForm"].resetFields();
            },
            keyupAnno: function () {
                var that = this;
                document.onkeydown = function (e) {
                    var _key = window.event.keyCode;
                    if (_key === 13) {
                        that.submitForm();
                    }
                };
            },
            addDocument: function () {
                var that = this;
                var input = anno.getInput();
                //获取文档的表单对象
                input.udoc = JSON.stringify(that.formData);
                //获取目录的表单对象
                input.ufolder = JSON.stringify(that.roleDataTable);
                anno.process(input, "Anno.Plugs.Logic/KNDocument/AddDocument", function (data) {
                    if (data.status === true) {
                        that.$message({
                            showClose: true,
                            message: "保存成功",
                            type: "success",
                        });
                        window.location.href = './knowledge/index.html';
                    } else {
                        that.$message.error(data.msg);
                    }
                });
            },
            handleSelectionChange: function (val) {
                this.roleDataTable = val;
            },
            isMobile: function () {
                if (window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
                    return true; // 移动端
                } else {
                    return false; // PC端
                }
            }
        }
    };
</script>
<style scoped>
.el-card {
  margin-bottom: 10px;
}
.el-card__header {
  padding: 5px 20px;
  font-size: 14px;
}
.el-card__body {
  padding-bottom: 0px;
}
</style>