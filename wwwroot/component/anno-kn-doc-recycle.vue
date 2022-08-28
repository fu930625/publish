<template>
    <div>
        
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
                <!--<el-table-column prop="secertLevel"
                                 label="密级"
                                 width="50"></el-table-column>-->
                <el-table-column label="名称" sortable="custom">
                    <template slot-scope="scope">
                        <img class="icon-file"
                             v-if="scope.row.type == 'folder'"
                             src="../img/Icon/folder.png" />
                        <template v-else-if="(scope.row.type == 'doc')">
                            <img class="icon-file" v-if="getFileType(scope.row.extName)" :src="getFileType(scope.row.extName)" />
                            <img class="icon-file" v-else src="../img/Icon/unknown.png" />
                        </template>
                        <a style="color: black; margin-left: 10px" @click="rowViewClick(scope.row)">{{scope.row.name}}</a>
                        
                    </template>
                </el-table-column>
                <el-table-column label="删除时间" width="180" sortable="custom">
                    <template slot-scope="scope">

                        <div class="hoverButton" v-show="scope.row.showFucArea">
                            <i class="el-icon-refresh-left" title="还原" @click="rowRecover(scope.row)"></i>
                            <i class="el-icon-delete" title="删除" @click="rowDelete(scope.row)"></i>
                        </div>
                        <span style="margin-left: 10px" v-show="!scope.row.showFucArea">
                            {{scope.row.recycleDate}}
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

    </div>
</template>

<script>
    module.exports = {
        data: function () {
            return {
                span: 8,
                currentFolder: { ID: "0", name: "根目录" },
                currentFolderData: [], //当前目录下的文件夹和文件列表
                folderList: [], //用户的所有目录数据列表
                docList: [], //用户的所有文件数据列表
                userInfo: {},//用户登录身份profile
                isModifiedState: false,//用来减少请求数据的频率，只有发生修改后才执行接口请求
            };
        },
        created: function () {
            if (this.isMobile() === true) {
                this.span = 23;
            }
            //用于数据初始化
            document.title = "我的回收区";
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
                            that.loadCurrentFolder();
                            //更新数据后，重置该状态
                            that.isModifiedState = false;
                        } else {
                            that.$message.error("获取Doc数据失败");
                        }
                    });
                } else {
                    //加载文件区根目录的内容
                    that.loadCurrentFolder();
                }
            },

            //加载指定文件夹的内容
            loadCurrentFolder: function () {
                let that = this;
                //debugger;
                that.currentFolderData = [];

                that.folderList.forEach(function (f, index) {
                    if (f.FolderType == 0 && f.IsDeleted) {
                        that.currentFolderData.push({
                            ID: f.ID,
                            type: "folder",
                            name: f.FolderName,
                            parent: f.ParentId,
                            recycleDate: that.dateFormat(f.LastModified),
                            showFucArea: false
                        })
                    }
                });
                that.docList.forEach(function (d, index) {
                    let docFolderId = d.FolderId == null ? "0" : d.FolderId;
                    if (d.IsDeleted) {
                        that.currentFolderData.push({
                            ID: d.ID,
                            type: "doc",
                            name: d.DocName,
                            extName: d.ExtName,
                            size: d.Size,
                            parent: docFolderId,
                            recycleDate: that.dateFormat(d.LastModified),
                            showFucArea: false
                        })
                    }
                });

            },

            rowViewClick: function (row) {
                if (row.type == "folder") {
                    this.$message("打开文件夹【" + row.name + "】");
                    //加载文件区根目录的内容
                    this.currentFolder = row;

                    this.LoadFolderData(this.currentFolder);
                } else {
                    //文件预览
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
                this.folderTreeData = [];
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
            rowRecover: function (row) {
                let that = this;
                that.$message("行还原");

                let input = anno.getInput();
                input.id = row.ID;
                let url = "";
                if (row.type == "folder") url = "Anno.Plugs.Logic/KNDocument/RecoverFolder";
                else url = "Anno.Plugs.Logic/KNDocument/RecoverDocument";
                anno.process(input, url, function (data) {
                    console.log("RecoverDocument-->", data);
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

            rowDelete: function (row) {
                let that = this;
                that.$message("行删除");
                let input = anno.getInput();
                input.id = row.ID;
                let url = "";
                if (row.type == "folder") url = "Anno.Plugs.Logic/KNDocument/DeleteFolder";
                else url = "Anno.Plugs.Logic/KNDocument/DeleteDocument";
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
            handleSelectionChange: function (val) {

            },
            handleSortChange: function (val) {
                this.$message("排序操作");
            },
            handleMouseEnter: function (row, column, cell, event) {
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
        left: -10px;
        width: 100px;
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