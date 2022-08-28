function login() {
    var input = anno.getInput();
    input.account = $("input[name=Account]").val();
    input.pwd = $("input[name=Pwd]").val();
    
    anno.process(input, "Anno.Plugs.Logic/Platform/Login", function (data, status) {
        if (status === "success" && data.msg === null) {
            localStorage.token = data.outputData.profile;
            localStorage.account = data.outputData.account;
            localStorage.profile = JSON.stringify(data.outputData);
            window.location.href = "/";
        } else {
            $("#msg").html(data.msg);
        }
    });
    
    //localStorage.token = "wfzfGLtNOOPVE/UPxh4EH8PHSUh5fWpS3QHqdV6B2KLvauiCovALeQ==";
    //localStorage.account = "anno";
    //localStorage.profile = '{"account":"anno","pwd":"nsiFvHyFuoM=","coid":"0","position":"Anno Admin","name":"anno","state":"1","profile":"wfzfGLtNOOPVE/UPxh4EH8PHSUh5fWpS3QHqdV6B2KLvauiCovALeQ==","timespan":"2022-08-16T21:04:42.5800664+08:00","rdt":"2019-11-26T10:30:02","ID":"210527169232896"}';
    //window.location.href = "/Home/Index";
}