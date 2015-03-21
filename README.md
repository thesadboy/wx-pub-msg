# wx-pub-msg
微信公众号消息群发（48小时无互动无法发送）
# 安装
npm i wx-pub-msg --save
# 使用
    var wx = require('wx-pub-msg');
    wx.send('user','pwd','msg', function(err){
      if(err){
        console.log(err);
      } else{
        console.log('发送任务派发完成');
      }
    });
# 说明
优先采用默认每天一条的群发（此方式无需48小时交互），在无法采用默认的群发方式后采用循环用户发送（此方式需要用户主动在48小时内有互动才能成功发送）
# 注意
目前只能发送文字消息（可带链接，具体能发送怎样的文字消息，可以自己先到公众号中去试验一下）
