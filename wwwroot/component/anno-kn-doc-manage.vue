<template>
    <div>
        <div class="upload-title">
			<!--
            <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item v-for="item in breadcrumbList" @click="breadcrumbClick(item)">{{item.name}}</el-breadcrumb-item>                
            </el-breadcrumb>
			-->
			<span v-for="(item,index) in breadcrumbList" @click="breadcrumbClick(item)" :key="item.ID">
				<i v-if="index>0" class="el-icon-arrow-right"></i>
				<a>{{item.name}}</a>
			</span>
        </div>
        <el-card>
            <el-form ref="elForm"
                     :model="formData"
                     :rules="rules"
                     size="mini"
                     label-width="100px"
                     label-position="right">
                <div slot="header" class="clearfix">
                    <span>上传文档</span>
                </div>
                <div class="upload-header">
                    <div class="upload-demo">
                        <el-upload accept=".txt, .pdf, .doc, .docx, .xls, .xlsx"
                                   action="/AnnoApi/Anno.Plugs.Logic/KNDocument/UploadFile"
                                   :data="uploadParam"
                                   :before-upload="onbeforeUpload"
                                   :on-preview="handlePreview"
                                   :on-remove="handleRemove"
                                   :on-change="onUploadChange"
                                   :on-success="onUploadSuccess"
                                   :on-error="onUploadError"
                                   multiple
                                   :limit="3"
                                   :show-file-list="false"
                                   :on-exceed="handleExceed">
                            <el-button style="margin-left: 10px"
                                       size="small"
                                       type="success">上传</el-button>
                            <div slot="tip" class="el-upload__tip">可上传文件格式：*.txt, *.pdf, *.doc, *.docx, *.xls, *.xlsx</div>
                            <div>

                            </div>
                        </el-upload>
                    </div>
                    <div class="upload-newWork">
                        <el-button type="primary" size="small" @click="addFolder">新建文件夹</el-button>
                    </div>
                </div>
            </el-form>
        </el-card>
        <el-card>
            <el-table :data="currentFolderData"
                      ref="currentFolderData"
                      stripe
                      border
                      @selection-change="handleSelectionChange"
                      @sort-change="handleSortChange"
                      @cell-mouse-enter="handleMouseEnter"
                      @cell-mouse-leave="handleMouseLeave"
                      size="mini"
                      style="width: 100%"
                      height="350"
                      :default-sort="{ prop: 'createDate', order: 'descending' }"
                      :row-class-name="tableRowClassName">
                <el-table-column type="selection" width="45"> </el-table-column>
                <el-table-column prop="secertLevel"
                                 label="密级"
                                 width="50"></el-table-column>
                <el-table-column label="名称" sortable="custom">
                    <template slot-scope="scope">
                        <img class="icon-file"
                             v-if="scope.row.type == 'folder'"
                             src="../img/Icon/folder.png" />
                        <template v-else-if="(scope.row.type == 'doc')">
                            <img class="icon-file" v-if="getFileType(scope.row.extName)" :src="getFileType(scope.row.extName)" />
                            <img class="icon-file" v-else src="../img/Icon/unknown.png" />
                        </template>
                        <a v-show="!scope.row.isModifiedRow" style="color: black; margin-left: 10px" @click="rowViewClick(scope.row)">{{scope.row.name}}</a>
                        <a v-show="scope.row.isModifiedRow">
                            <el-input placeholder="请输入名称" v-model="scope.row.name" size="small" style="width:60%"></el-input>
                            <i class="el-icon-check" title="确定" @click="submitModify(scope.row)"></i>
                            <i class="el-icon-close" title="取消" @click="cancleModify(scope.row)"></i>
                        </a>
                    </template>
                </el-table-column>
                <el-table-column label="修改时间" width="180" sortable="custom">
                    <template slot-scope="scope">

                        <div class="hoverButton" v-show="scope.row.showFucArea">
                            <i class="el-icon-edit" title="编辑" @click="rowModify(scope.row)"></i>
                            <i class="el-icon-share" title="分享" @click="rowShare(scope.row)"></i>
                            <i class="el-icon-rank" title="移动" @click="rowMove(scope.row)"></i>
                            <i class="el-icon-delete" title="删除" @click="rowDelete(scope.row)"></i>
                            <i class="el-icon-setting" title="设置" @click="rowSetting(scope.row)"></i>
                        </div>
                        <span style="margin-left: 10px" v-show="!scope.row.showFucArea">
                            {{scope.row.createDate}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="类型" width="120" sortable="custom">
                    <template slot-scope="scope">
                        <div v-show="!scope.row.showFucArea">
                            <span v-if="scope.row.type == 'folder'">文件夹</span>
                            <span v-else>{{ scope.row.extName }}文件</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="大小" width="100" sortable="custom">
                    <template slot-scope="scope">
                        <div v-show="!scope.row.showFucArea">
                            <span v-if="scope.row.type == 'folder'">-</span>
                            <span v-else>{{ scope.row.size }}</span>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!--权限设置对话框-->
        <el-dialog title="设置文件/文件夹权限" :visible.sync="dialogRadioVisible" >
			<el-radio-group v-model="radioSecret">
				<el-radio label="0" isChecked="true">所有人可见</el-radio>
				<el-radio label="1">仅自己可见</el-radio>
			</el-radio-group>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogRadioVisible = false">取 消</el-button>
                <el-button type="primary" @click="setSecretSubmit">确 定</el-button>
            </div>
        </el-dialog>

        <!--目录树对话框-->
        <el-dialog title="目录树" :visible.sync="dialogTreeVisible">
            <el-tree :data="folderTreeData"
                     default-expand-all
                     node-key="id"
                     ref="tree"
                     highlight-current
                     :props="defaultProps"
                     @node-click="handleNodeClick">
            </el-tree>

            <el-label v-if="selectFolderNode.id>0" >移动到【{{selectFolderNode.label}}】目录</el-label>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogTreeVisible = false">取 消</el-button>
                <el-button type="primary" @click="moveSubmit">确 定</el-button>
            </div>
        </el-dialog>
   {{openfile}}<anno-open-file  :visible="visible.fileDialog" v-if="openfile"></anno-open-file>

    </div>
</template>

<script>
    // Vue.use(httpVueLoader);

    // import annoOpenFile from './anno-open-file.vue';
     module.exports = {
        components: {
            'anno-open-file': httpVueLoader('./anno-open-file.vue')
        },
        data() {
            return {
                openfile: false,
                visible: {
                    fileDialog: 0
                },
                span: 8,
                currentFolder: { ID: "0", name: "根目录" },
                //当前目录下的文件夹和文件列表
                currentFolderData: [
                    {
                        ID: 1,
                        type: "folder",
                        src: '',
                        name: "ABC项目",
                        parent: "folder_user_001",
                        createDate: "2022-7-20 20:00",
                        secertLevel: 1,
                        showFucArea: false,
                    },
                    {
                        ID: 2,
                        type: "folder",
                        name: "DFG项目",
                        parent: "folder_user_001",
                        createDate: "2022-7-20 20:00",
                        secertLevel: 0,
                        showFucArea: false,
                    },
                    {
                        ID: 3,
                        type: "doc",
                        name: "工作心得.docx",
                        extName: "docx",
                        size: "5.8M",
                        parent: "folder_user_001",
                        createDate: "2022-7-22 22:00",
                        secertLevel: 2,
                        showFucArea: false,
                    },
                    {
                        ID: 7,
                        type: "doc",
                        name: "ElementUI使用手册.pdf",
                        extName: "pdf",
                        size: "20.8M",
                        parent: "folder_user_001",
                        createDate: "2022-7-22 10:00",
                        secertLevel: 0,
                        showFucArea: false,
                    },
                    {
                        ID: 8,
                        type: "doc",
                        name: "系统配置文件.ini",
                        extName: "ini",
                        size: "2K",
                        parent: "folder_user_001",
                        createDate: "2022-7-22 10:00",
                        secertLevel: 1,
                        showFucArea: false,
                    },
                    {
                        ID: 4,
                        type: "doc",
                        name: "工作记录.xls",
                        extName: "xls",
                        size: "1.8M",
                        parent: "folder_user_001",
                        createDate: "2022-7-22 10:00",
                        secertLevel: 2,
                        showFucArea: false,
                    },
                    {
                        ID: 5,
                        type: "doc",
                        name: "其他.txt",
                        extName: "txt",
                        size: "7K",
                        parent: "folder_user_001",
                        createDate: "2022-6-20 20:00",
                        secertLevel: 1,
                        showFucArea: false,
                    },
                ],
                fileList: [], //上传控件的文件列表
                folderList: [], //用户的所有目录数据列表
                docList: [], //用户的所有文件数据列表
                userInfo: {},//用户登录身份profile
                breadcrumbList: [], //目录导航区数组
                isModifiedState: false,//用来减少请求数据的频率，只有发生修改后才执行接口请求
                formData: {
                    DocName: "",
                    ExtName: "",
                    Size: "",
                    Path: "1",
                    UploaderID: "",
                    UploaderName: "",
                    DocState: "",
                    SecLevel: "",
                    file: null,
                },
                uploadParam: {
                    folderId: 0, profile: {}
                },
                radioSecret: 1,
                dialogRadioVisible: false,//权限设置对话框
                folderTreeData: [],
                dialogTreeVisible: false,//目录树对话框
                selectFolderNode:{id:0,label:""},//目录树选中的节点
                defaultProps: {
                    children: 'children',
                    label: 'label',
                    isLeaf: 'leaf'
                },
                tempRowData: null,//行设置、行移动使用的临时行数据对象
                //   newFolderName:"",
                stateOptions: [
                    {
                        value: "0",
                        label: "禁用",
                    },
                    {
                        value: "1",
                        label: "启用",
                    },
                ],
                rules: {
                    name: [
                        {
                            required: true,
                            message: "请输入用户名",
                            trigger: "blur",
                        },
                    ],
                    account: [
                        {
                            required: true,
                            message: "请输入登录名",
                            trigger: "blur",
                        },
                    ],
                    state: [
                        {
                            required: true,
                            message: "请选择状态",
                            trigger: "blur",
                        },
                    ],
                    pwd: [
                        {
                            required: true,
                            message: "请输入密码",
                            trigger: "blur",
                        },
                    ],
                },
            };
        },
        created: function () {
            if (this.isMobile() === true) {
                this.span = 23;
            }
            //用于数据初始化
            document.title = "我的文件";
            //console.log("当前目录-->",this.currentFolder);
            this.LoadFolderData(this.currentFolder);
            //this.keyupAnno();
        },
        computed: {
            getFileType() {
                return function (type) {
                    let url = '';
                    switch (type) {
                        case 'folder': url = "../img/Icon/folder.png"
                            break;
                        case 'docx' || 'doc': url = "../img/Icon/word.png"
                            break;
                        case 'xlsx' || 'xls': url = "../img/Icon/excel.png"
                            break;
                        case 'pdf': url = "../img/Icon/pdf.png"
                            break;
                        case 'txt': url = "../img/Icon/txt.png"
                            break;
                        default: url = "../img/Icon/unknown.png"

                    }
                    return url;
                }
            }

        },
        methods: {
            LoadFolderData: function (folderObj) {
                //debugger;
                let that = this;

                if (that.folderList.length == 0 || that.isModifiedState) {
                    var input = anno.getInput();//localStorage.profile;
                    if (localStorage.profile == undefined && localStorage.profile == "") {
                        console.log("未获取身份");
                        return;
                    }
                    that.userInfo = JSON.parse(localStorage.profile);
                    //input.member = "{ID:'210527169232896'}";
                    //let userId = localStorage.profile.ID;
                    console.log("localStorage.profile-->", that.userInfo);

                    input.member = "{ID:'" + that.userInfo.ID + "'}";
                    anno.process(input, "Anno.Plugs.Logic/KNDocument/GetFolderListByMember", function (data) {
                        console.log("folderData-->", data);
                        if (data.status) {
                            that.folderList = data.outputData;
                        } else {
                            that.$message.error("获取Folder数据失败");
                        }
                    });

                    anno.process(input, "Anno.Plugs.Logic/KNDocument/GetDocumentListByMember", function (data) {
                        console.log("docData-->", data);
                        if (data.status) {
                            that.docList = data.outputData;

                            //加载文件区根目录的内容
                            that.loadCurrentFolder(folderObj);
                            //更新数据后，重置该状态
                            that.isModifiedState = false;
                        } else {
                            that.$message.error("获取Doc数据失败");
                        }
                    });
                } else {
                    //加载文件区根目录的内容
                    that.loadCurrentFolder(folderObj);
                }
                /*
                docList = [
                    {
                        "DocName": "程序员：新手到专家的5个阶段.docx",
                        "ExtName": ".docx",
                        "Size": "205000",
                        "Path": null,
                        "UploaderID": "210527169232896",
                        "UploaderName": "Anno管理员",
                        "UploadTime": "2022-08-18T21:24:56.24",
                        "DocState": "0",
                        "SecLevel": "0",
                        "IsDeleted": false,
                        "FolderName": null,
                        "FolderId": null,
                        "ID": "563166942273536"
                    }
                ];

                folderList = [
                    {
                        "FolderName": "项目目录",
                        "Summary": null,
                        "CreaterID": "210527169232896",
                        "CreaterName": "Anno admin",
                        "CreatTime": "2022-08-18T20:33:39.443",
                        "LastModified": "2022-08-18T20:33:39.443",
                        "FolderType": "0",
                        "SecLevel": "0",
                        "IsDelete": false,
                        "ParentId": "2022081820270001",
                        "ID": "90001"
                    }
                ];
                */
            },

            //加载指定文件夹的内容
            loadCurrentFolder: function (folderObj) {
                let that = this;
                //debugger;
                that.currentFolderData = [];

                that.folderList.forEach(function (f, index) {
                    if (f.FolderType == 0 && f.ParentId == folderObj.ID && !f.IsDeleted) {
                        that.currentFolderData.push({
                            ID: f.ID,
                            type: "folder",
                            name: f.FolderName,
                            parent: folderObj.ID,
                            createDate: that.dateFormat(f.LastModified), 
                            secertLevel: f.SecLevel,
                            showFucArea: false
                        })
                    }
                });
                that.docList.forEach(function (d, index) {
                    let docFolder = d.FolderId == null ? "0" : d.FolderId;
                    if (docFolder == folderObj.ID && !d.IsDeleted) {
                        that.currentFolderData.push({
                            ID: d.ID,
                            type: "doc",
                            name: d.DocName,
                            extName: d.ExtName,
                            size: d.Size,
                            parent: folderObj.ID,
                            createDate: that.dateFormat(d.LastModified),
                            secertLevel: d.SecLevel,
                            showFucArea: false
                        })
                    }
                });

                //收集面包屑数组
                that.breadcrumbList.push(folderObj);
            },
            //导航区的目录点击时，重新加载接口数据，并打开对应目录
            breadcrumbClick: function (folder) {

                let lastIndex = this.breadcrumbList.length - 1;
                console.log("breadcrumbList切换前-->", this.breadcrumbList);
                if (this.breadcrumbList[lastIndex].ID == folder.ID) {
                    this.$message("当前目录，无须切换");
                    return;
                }
                this.$message("切换到【" + folder.name + "】目录");

                this.LoadFolderData(folder);
                for (let i = lastIndex; i >= 0; i--) {
                    let obj = this.breadcrumbList[i];
                    if (obj.ID != folder.ID) {
                        this.breadcrumbList.pop();
                    } else {
                        this.breadcrumbList.pop();
                        break;
                    }
                }

                //切换后设置当前目录
                this.currentFolder = folder;
                console.log("breadcrumbList切换后-->", this.breadcrumbList);
                console.log("切换后-->", this.currentFolder);

            },
            onbeforeUpload: function (file) {
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

                //设置上传参数
                this.uploadParam.folderId = this.currentFolder.ID;
                this.uploadParam.profile = localStorage.profile;
                console.log("uploadParam-->", this.uploadParam);

                return true;
            },
            handleExceed: function (files, fileList) {
                this.$message.warning(
                    `当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length
                    } 个文件`
                );

                return;
            },
            handlePreview(file) {
                console.log("file", file)
            },
            handleRemove(file) {
                console.log("file", file)
                //删除文件
                if (file && file.status == "success") {
                    const fu = file.uid;
                    const num = this.fileList.findIndex((value) => value.uid === fu);
                    this.fileList.splice(num, 1);
                    this.upImgToString();
                }
            },

            onUploadChange: function (file, fileList) {
                //console.log("onUploadChange",file,fileList);
                //this.formData.file = file;
                //this.formData.DocName = file.name;
                //this.formData.ExtName = file.name.replace(/.+\./, "");
                //this.formData.Size = file.size;
                //this.formData.Path = currentFolder.name;
                //console.log(this.formData);
            },
            onUploadSuccess: function (response, file, fileList) {
                console.log("onUploadSuccess-->", response);
                console.log("onUploadSuccess-file->", file);
                /*
                  if (data.status === true) {
                    that.$message({
                      showClose: true,
                      message: "保存成功",
                      type: "success",
                    });
                    window.location.href = "./knowledge/index.html";
                  } else {
                    that.$message.error(data.msg);
                  }
                 */
                let obj = {
                    ID: response.outputData.ID,
                    type: "doc",
                    name: file.name,
                    extName: file.name.replace(/.+\./, ""),
                    size: file.size,
                    parent: this.currentFolder.ID,
                    createDate: this.getCurrentTime(),
                    secertLevel: 0,
                    showFucArea: false
                };
                /*fileList.forEach((v) => {
                    obj = {
                        name: v.name,
                        type: "doc",
                        ext: v.ExtName
                    }
                })*/
                this.currentFolderData.push(obj)

                //发生数据更新，设置该状态
                this.isModifiedState = true;
            },
            onUploadError: function (err, file, fileList) {
                console.log("onUploadError-->", err);
            },

            //onUpload: function (file) {
            //  let upFile = file.file;
            //  this.formData.file = upFile;
            //  this.formData.DocName = upFile.name;
            //  this.formData.ExtName = upFile.name.replace(/.+\./, "");
            //  this.formData.Size = upFile.size;
            //  console.log(this.formData.DocName);
            //  console.log(this.formData.ExtName);
            //},

            addFolder: function () {
                if (this.currentFolderData.length > 0 && this.currentFolderData[0].isModifiedRow) return;

                this.currentFolderData.unshift({
                    ID: 0,
                    type: "folder",
                    name: "",
                    parent: this.currentFolder.ID,
                    createDate: this.getCurrentTime(),
                    secertLevel: 0,
                    showFucArea: false,
                    isModifiedRow: true
                });
            },
            submitModify: function (row) {
                let that = this;
                that.$message("提交编辑结果");
                if (row.type == "folder") {
                    //新建文件夹
                    if (row.ID == 0) {

                        let profile = localStorage.profile;
                        let input = anno.getInput();
                        input.ufolder = '{FolderName:"' + row.name + '",CreaterID:"' + that.userInfo.ID
                            + '",CreaterName:"' + that.userInfo.name + '",SecLevel:0,FolderType:0,ParentId:' + that.currentFolder.ID + '}';
                        anno.process(input, "Anno.Plugs.Logic/KNDocument/AddFolder", function (data) {
                            console.log("AddFolder-->", data);
                            if (data.status) {
                                row.ID = data.outputData.ID;
                            }
                            that.$message(data.msg);
                        });
                    } else {
                        //修改文件夹名称
                        let input = anno.getInput();
                        input.id = row.ID;
                        input.name = row.name;
                        anno.process(input, "Anno.Plugs.Logic/KNDocument/UpdateFolderName", function (data) {
                            console.log("UpdateFolderName-->", data);
                            if (data.status) {
                                //row.ID = data.outputData.ID;
                            }
                            that.$message(data.msg);
                        });
                    }

                } else {
                    //修改文件名称
                    let input = anno.getInput();
                    input.id = row.ID;
                    input.name = row.name;
                    anno.process(input, "Anno.Plugs.Logic/KNDocument/UpdateDocName", function (data) {
                        console.log("UpdateDocName-->", data);
                        if (data.status) {
                            //row.ID = data.outputData.ID;
                        }
                        that.$message(data.msg);
                    });
                }

                row.isModifiedRow = false;
                //发生数据更新，设置该状态
                that.isModifiedState = true;
            },
            cancleModify: function (row) {
                this.$message("取消编辑");
                if (row.ID > 0)
                    row.isModifiedRow = false;
                else
                    this.currentFolderData.shift();
            },

            rowViewClick: function (row) {
                if (row.type == "folder") {
                    this.$message("打开文件夹【" + row.name + "】");
                    //加载文件区根目录的内容
                    this.currentFolder = row;

                    this.LoadFolderData(this.currentFolder);
                } else {
                    // //文件预览
                     this.openfile = true;
                    this.visible.fileDialog = new Date().getTime();
                    this.$message("预览文件【" + row.name + "】");
                }
            },
            rowModify: function (row) {
                this.$message("行编辑");
                if (!row.isModifiedRow)
                    row["isModifiedRow"] = true;
            },
            rowShare: function (row) {
                this.$message("行分享");
            },
            rowMove: function (row) {
                this.$message("行移动");
                //过滤掉删除的目录及收藏夹
                let list = this.folderList.filter(f => f.FolderType == 0 && !f.IsDeleted);
                if (list.length == 0) this.$message("没有可选的文件夹");

                //初始化目录树，重新生成
                //if(this.folderTreeData.length==0 || this.isModifiedState){
                    this.folderTreeData=[];
                    this.buildTree(list, this.folderTreeData, 0);
                //}
                console.log("folderTreeData-->", this.folderTreeData);
                //默认设置当前父节点选中
                //this.$refs.tree.setCheckedKeys([row.parent]);

                this.dialogTreeVisible = true;
                this.tempRowData = row;
                //发生数据更新，设置该状态
                this.isModifiedState = true;
            },
            //基于目录数组生成目录树
            buildTree: function (list, result, fid) {
                let that = this;
                //let result = list.filter(l => l.ParentId == fid);
                list.forEach(function (f, index) {
                    if (f.ParentId == fid) {
                        let childArr = [];
                        that.buildTree(list, childArr, f.ID);
                        result.push({
                            id: f.ID,
                            label: f.FolderName,
                            parent: fid,
                            children: childArr
                        });
                    }
                });
            },
            handleNodeClick: function (data) {
                console.log("selectedTreeNode-->", data);
                //目标位置为当前所在目录
                // if(data.id == this.tempRowData.parent){
                //     this.$message("位置未发生变化");
                // }
                //目标位置为待移动的对象
                if(data.id == this.tempRowData.ID){
                    this.$message("不能移动到自己下面");
                }
                this.selectFolderNode = data;
            },
            moveSubmit: function () {
                let that = this;
                that.$message("移动" + that.tempRowData.type == "folder" ? "文件夹" : "文件"
                    + "【" + that.tempRowData.name + "】到【" + that.selectFolderNode.label + "】");
                
                //目标位置为当前所在目录
                if(that.selectFolderNode.id == that.tempRowData.parent){
                    that.dialogTreeVisible = false;
                    that.$message("位置未发生变化");
                    return;
                }
                if(that.selectFolderNode.id == that.tempRowData.ID){
                    that.dialogTreeVisible = false;
                    that.$message("不能移动到自己下面");
                    return;
                }
                

                //移动文件/文件夹
                let input = anno.getInput();
                input.id = that.tempRowData.ID;
                input.parent = that.selectFolderNode.id;
                let objType = that.tempRowData.type;
                let url = "";
                if (objType == "folder") url = "Anno.Plugs.Logic/KNDocument/UpdateFolderParent";
                else url = "Anno.Plugs.Logic/KNDocument/UpdateDocumentParent";
                anno.process(input, url, function (data) {
                    console.log("moveSubmit-->", data);
                    if (data.status) {
                        that.currentFolderData.forEach((item, index) => {
                            if (item.ID == input.id) {
                                that.currentFolderData.splice(index, 1);
                                /*//更新基础数据，避免重新请求接口
                                if (objType == "folder") {
                                    let folderObj = that.folderList.find(f => f.ID == input.id);
                                    folderObj.parent = input.parent;
                                }
                                else {
                                    let docObj = that.docList.find(d => d.ID == input.id);
                                    docObj.parent = input.parent;
                                }*/
                            }
                        });
                    }
                    that.$message(data.msg);
                });
                that.dialogTreeVisible = false;
                //发生数据更新，设置该状态
                that.isModifiedState = true;

            },
            //loadNode: function (node, resolve) {
            //    if (node.level === 0) {
            //        return resolve(
            //            //[{ name: 'region' }]
            //            that.folderTreeData.filter(n => n.parent == 0);
            //        );
            //    }
            //    if (node.level > 1) return resolve([]);

            //    setTimeout(() => {
            //        const data = [{
            //            name: 'leaf',
            //            leaf: true
            //        }, {
            //            name: 'zone'
            //        }];

            //        resolve(data);
            //    }, 500);
            //},
            rowDelete: function (row) {
                let that = this;
                that.$message("行回收");
                //修改文件名称
                let input = anno.getInput();
                input.id = row.ID;
                let url = "";
                if (row.type == "folder") url = "Anno.Plugs.Logic/KNDocument/RecycleFolder";
                else url = "Anno.Plugs.Logic/KNDocument/RecycleDocument";
                anno.process(input, url, function (data) {
                    console.log("RecycleDocument-->", data);
                    if (data.status) {
                        that.currentFolderData.forEach((item, index) => {
                            if (item.ID == row.ID) {
                                that.currentFolderData.splice(index, 1);
                            }
                        });
                    }
                    that.$message(data.msg);
                });

                //发生数据更新，设置该状态
                that.isModifiedState = true;
            },
            rowSetting: function (row) {
                console.log(" row.secertLevel", row.secertLevels)
                //this.$message("行设置");
                this.dialogRadioVisible = true;
                this.tempRowData = row;
                this.radioSecret = row.secertLevel.toString();

            },
            //文件、文件夹权限-提交修改
            setSecretSubmit: function () {

                let that = this;
                that.$message("文件权限-提交修改");
                //修改文件权限
                let input = anno.getInput();
                input.id = that.tempRowData.ID;
                input.secret = that.radioSecret;//that.tempRowData.secertLevel;
                let url = "";
                if (that.tempRowData.type == "folder") url = "Anno.Plugs.Logic/KNDocument/UpdateFolderSecretLevel";
                else url = "Anno.Plugs.Logic/KNDocument/UpdateDocumentSecretLevel";
                anno.process(input, url, function (data) {
                    console.log("UpdateSecretLevel-->", data);
                    if (data.status) {
                        that.currentFolderData.forEach((item, index) => {
                            if (item.ID == input.id) {
                                item.secertLevel = input.secret;
                            }
                        });
                    }
                    that.$message(data.msg);
                });

                that.dialogRadioVisible = false;
                //还原相关值记录
                //that.radioSecret="0";
                //that.tempRowData=null;

                //发生数据更新，设置该状态
                //that.isModifiedState = true;
            },
            getCurrentTime: function () {
                let year = new Date().getFullYear();
                let month = new Date().getMonth() + 1;
                let day = new Date().getDate();
                let hour = new Date().getHours();
                let minute = new Date().getMinutes();

                return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
            },
            dateFormat: function (dateString) {
                if (dateString == null) return "";
                if (dateString.indexOf("T") > 0) dateString = dateString.replace("T", " ");

                return dateString.substr(0, 16);
            },
            //postUpload: function (file) {
            //  return axios({
            //    url: "upload",
            //    method: "post",
            //    data: file,
            //    headers: {
            //      "Content-Type": "multipart/form-data",
            //    },
            //  });
            //},
            //getFolderData: function () {
            //  var that = this;
            //  var input = anno.getInput();
            //  input.uid = -1;
            //  anno.process(
            //    input,
            //    "Anno.Plugs.Logic/KNDocument/GetUserFolders",
            //    function (data) {
            //      if (data.status === true) {
            //        that.currentFolderData = data.outputData.lr;
            //      } else {
            //        that.$message.error("获取角色：" + data.msg);
            //      }
            //    }
            //  );
            //},
            //submitForm: function () {
            //  var that = this;
            //  this.$refs["elForm"].validate(function (valid) {
            //    if (!valid) return;
            //    //if(that.roleDataTable.length<=0){
            //    //   that.$message.error("至少选择一个角色");
            //    //  return;
            //    //}
            //    that.addDocument();
            //  });
            //},
            //resetForm: function () {
            //  this.$refs["elForm"].resetFields();
            //},
            //keyupAnno: function () {
            //  var that = this;
            //  document.onkeydown = function (e) {
            //    var _key = window.event.keyCode;
            //    if (_key === 13) {
            //      that.submitForm();
            //    }
            //  };
            //},
            //addDocument: function () {
            //  var that = this;
            //  var input = anno.getInput();
            //  //获取文档的表单对象
            //  input.udoc = JSON.stringify(that.formData);
            //  //获取目录的表单对象
            //  input.ufolder = JSON.stringify(that.roleDataTable);
            //  anno.process(
            //    input,
            //    "Anno.Plugs.Logic/KNDocument/AddDocument",
            //    function (data) {
            //      if (data.status === true) {
            //        that.$message({
            //          showClose: true,
            //          message: "保存成功",
            //          type: "success",
            //        });
            //        window.location.href = "./knowledge/index.html";
            //      } else {
            //        that.$message.error(data.msg);
            //      }
            //    }
            //  );
            //},
            handleSelectionChange: function (val) {

            },
            handleSortChange: function (val) {
                this.$message("排序操作");
            },
            handleMouseEnter: function (row, column, cell, event) {
                if (!row.isModifiedRow)
                    row.showFucArea = true;
            },
            handleMouseLeave: function (row, column, cell, event) {
                row.showFucArea = false;
            },
            tableRowClassName: function (row, index) {
                //console.log("rowclass-->",row)
                if (row.secertLevel == 0) {
                    return "warning-row";
                } else if (row.secertLevel == 1) {
                    return "success-row";
                } else {
                    return "";
                }
            },
            isMobile: function () {
                if (
                    window.navigator.userAgent.match(
                        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
                    )
                ) {
                    return true; // 移动端
                } else {
                    return false; // PC端
                }
            }
        },
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

    .list-wrap {
        position: relative;
        overflow-y: scroll;
        width: 200px;
        margin: 100px auto;
        box-sizing: border-box;
        border: solid 1px red;
    }

    .upload-header {
        display: block;
        width: 100%;
        min-height: 66px;
    }

    .icon-file {
        width: 24px;
        vertical-align: middle;
        /*line-height: 24px;*/
    }

    .upload-demo {
        display: inline-block;
        float: left;
    }

    .upload-newWork {
        float: right;
    }

    .upload-title {
        padding: 8px
    }

    .list {
        list-style: none;
        padding: 0;
    }

        .list li {
            border: solid 0px blue;
            line-height: 30px;
            /* list-style-type:none;
        list-style-image: url(images/icon.gif); */
        }

    .li_hover {
        background-color: lightskyblue;
        display: inline;
    }

    .li_selected {
        background-color: lightseagreen;
        border: solid 1px seagreen;
        display: inline;
    }

    .hoverButton {
        z-index: 99;
        display: block;
        position: absolute;
        top: 5px;
        left: -50px;
        width: 300px;
    }

    i {
        cursor: pointer;
        width: 24px;
    }

    .list li img {
        width: 24px;
        vertical-align: middle;
        /*line-height: 24px;*/
    }

    .list li span {
        vertical-align: middle;
        color: gray;
    }
</style>