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
目前是通过获取用户列表，并循环进行发送，后期会加上优先调用公众号中的群发功能
# 注意
目前的方式要求48小时内用户有交互才能发送成功，且只能发送文字消息（可带链接，具体能发送怎样的文字消息，可以自己先到公众号中去试验一下）
