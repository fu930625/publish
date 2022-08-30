/// <reference path="../../js/jquery.js" />
/// <reference path="../../js/base.js" />
var vm = null, _isMobile = false;
$(function () {
    Init();
});

function Init() {
    vm = new Vue({
        el: '#search',
        data: {
          input: '',
          isSearchResult: true,
          selectOptions: [{
            value: '选项1',
            label: '黄金糕'
          }, {
            value: '选项2',
            label: '双皮奶'
          }, {
            value: '选项3',
            label: '蚵仔煎'
          }, {
            value: '选项4',
            label: '龙须面'
          }, {
            value: '选项5',
            label: '北京烤鸭'
          }],
          value: '',
          hotList: [
            {
              name: '防疫政策',
              id: '1',
              index: '1',
              url: '//www.baidu.com/'
            },
            {
              name: '房贷利率',
              id: '2',
              index: '2'
            },
            {
              name: '毕业设计',
              id: '3',
              index: '3'
            },
            {
              name: '论文答辩',
              id: '4',
              index: '4'
            },
            {
              name: '大分子材料',
              id: '5',
              index: '5'
            },
            {
              name: '河南考生人数125万,河南考生人数125万河南考生人数125万河南考生人数125万河南考生人数125万河南考生人数125万',
              id: '6',
              index: '6'
            },
            {
              name: '钢解构',
              id: '7',
              index: '7'
            },
            {
              name: '知识管理',
              id: '8',
              index: '8'
            },
            {
              name: '人工智能',
              id: '9',
              index: '9'
            },
            {
              name: '自然科学',
              id: '10',
              index: '10'
            },
          ],
          historyList: [
            {
              name: '防疫政策',
              id: '1',
              index: '1'
            },
            {
              name: '房贷利率',
              id: '2',
              index: '2'
            },
            {
              name: '毕业设计',
              id: '3',
              index: '3'
            },
            {
              name: '论文答辩',
              id: '4',
              index: '4'
            },
            {
              name: '大分子材料',
              id: '5',
              index: '5'
            },
            {
              name: '今年为何是最热一年',
              id: '6',
              index: '6'
            },
            {
              name: '钢解构',
              id: '7',
              index: '7'
            },
            {
              name: '知识管理',
              id: '8',
              index: '8'
            },
            {
              name: '人工智能',
              id: '9',
              index: '9'
            },
            {
              name: '自然科学',
              id: '10',
              index: '10'
            },
          ],
          resultList: [
            {
              name: '北京故宫博物院',
              detail: '北京故宫博物院建立于1925年,是在明朝、清朝两代皇宫及其收藏的基础上建立起来的中国综合性博物馆,也是中国最大的古代文化艺术博物馆,其文物收藏只要来源于清代宫中旧藏。',
              Contributor: '单霁翔',
              date: '2022-7-1',
              fabulous: '3万赞同',
              Collection: '5.8万收藏'
            },
            {
              name: '北京故宫博物院',
              detail: '北京故宫博物院建立于1925年,是在明朝、清朝两代皇宫及其收藏的基础上建立起来的中国综合性博物馆,也是中国最大的古代文化艺术博物馆,其文物收藏只要来源于清代宫中旧藏。',
              Contributor: '单霁翔',
              date: '2022-7-1',
              fabulous: '3万赞同',
              Collection: '5.8万收藏'
            },
          ],
          red_text: '北京 博物院',
          // formData: {
            total: 0,
            currentPage: 1,
            pagesize: 20,
            pagesizes: [10, 20, 30, 40]
          // }
        }, methods: {
          handleClickUrl(item) {
            window.location.href = item.url
          },
          handleSearch(value) {
            debugger
            console.log("value",value)
            this.isSearchResult = false;
            let that = this;
            let param = {q: 'pdf_keywords:'+value}
            // window.$.ajax({
            //     url: "http://localhost:8983/solr/ImportPDFCore/select",
            //       type: "GET",
            //       dataType: "jsonp", //指定服务器返回的数据类型
            //       data: param,
            //       success: function (data) {
            //         console.log("data",data)
            //       }
            //   });
              anno.axios(param,"http://localhost:8983/solr/ImportPDFCore/select", function (data) {
                debugger
              if (data.status) {
              } else {
                that.$message.error(data.msg);
              }
            });
            // window.location.href = './result.html';
          },
          hightLight(el, binding) {
            const match = binding.value;
            const reg = new RegExp(match, 'g')
            const txt = binding.arg
            let str = '';
            if (txt) {
              str = txt.replace(reg, `<span style="color:#F96600">${match}</span>`)
            } else {
              str = ''
            }
            el.innerHTML = str;
          },
          searchColor(text) {
            let red_text = this.red_text;
            let str = text;
            let inputValue = red_text.replace(/\ +/g, ",")
            let keyWordArr = inputValue.split(",");
            if(str && str !== "") {
              keyWordArr.forEach(e => {
                let regStr = ""+ `(${e})`;
                let reg = new RegExp(regStr, "g")
                str = str.replace(reg, '<span style="color: red;">' + e + '</span>')
              });
            }
            return str

          },

        searchResultTableList() {
          // 请求接口
          // this.resultList = res;
        },
        handleSizeChange (v) {
            this.pagesize = v;
            this.currentPage = 1;
            this.searchResultTableList()
        },
        handleCurrentChange (v) {
          this.currentPage = v;
          this.searchResultTableList()
        },
          
        }, created: function () {
            $("#search").show();
        },
        directives: {
          textLight: { // 为元素设置指定的字体颜色
            bind(el, binding) {
              hightLight(el, binding)
          }
         }
       }
      })
}

