/**
 * Created by Nick on 15/3/18.
 */
"use strict";
var superAgent = require('superagent'),
	md5 = require('crypto').createHash('md5'),
	loginData,
	friends;

var getMd5 = function (pwd) {
		md5.update(pwd);
		return md5.digest('hex');
	},
	/**
	 * 登录
	 * @param user
	 * @param pwd
	 * @param cb 登录回调
	 */
	login = function (user, pwd, cb) {
		superAgent.post('https://mp.weixin.qq.com/cgi-bin/login?lang=zh_CN')
			.type('form')
			.set('Referer', 'https://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&lang=zh_CN')
			.send({
				username: user,
				pwd: getMd5(pwd),
				imgcode: '',
				f: 'json'
			}).end(function (err, res) {
				if (err) {
					return cb && cb('登录错误，请稍后再试！');
				}
				var data = res.body.base_resp;
				if (data.ret != 0) {
					return cb && cb('登录错误，请检查用户名和密码或稍后再试！')
				}
				loginData = {
					token: res.body.redirect_url ? res.body.redirect_url.match(/token=(\d+)/)[1] : '',
					cookie: res.header['set-cookie'].join('').replace(/(httponly)\s*/gim, '')
				};
				return cb && cb(null, loginData);
			});
	},
	/**
	 * 获取关注用户列表
	 * @param cb 回去关注后的回调
	 */
	getFriendsList = function (cb) {
		superAgent.get('https://mp.weixin.qq.com/cgi-bin/contactmanage?t=user/index&pageidx=0&type=0&token=' + loginData.token + '&lang=zh_CN')
			.set('Cookie', loginData.cookie)
			.end(function (err, res) {
				if (err) {
					return cb && cb('获取关注列表失败！');
				}
				var text = res.text.replace(/[\r\n\s]/gim, ''), contacts;
				text = text.match(/\(({"contacts":[^\)]*)/);
				text = text && text.length > 1 ? text[1] : '{"contacts":[]}';
				contacts = eval('(' + text + ')').contacts;
				friends = contacts;
				return cb && cb(null, contacts);
			});
	},
	/**
	 * 对某一个用户发信息
	 * @param friend 某一个用户的信息
	 * @param msg 发送的消息体
	 */
	sendMsgToFriend = function (friend, msg) {
		var sendParams = {
			type: 1,
			content: msg,
			error: false,
			tofakeid: friend.id,
			token: loginData.token,
			lang: 'zh_CN',
			f: 'json',
			ajax: 1,
			random: Math.random(),
			imgcode: ''
		};
		superAgent.post('https://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&f=json&token=' + loginData.token + '&lang=zh_CN')
			.type('form')
			.send(sendParams)
			.set('Cookie', loginData.cookie)
			.set('Referer', 'https://mp.weixin.qq.com/cgi-bin/singlesendpage?t=message/send&action=index&tofakeid=' + friend.id + '&token=' + loginData.token + '&lang=zh_CN')
			.end(function (err, res) {
				if (err || res.body.base_resp.ret != 0) {
					console.error('发送到“%s”失败！', friend.nick_name);
					if (res && res.body.base_resp.ret == 10706) {
						console.warn('用户“%s”已经超过48小时未联系，故无法发送消息！', friend.nick_name)
					} else {
						console.error('失败日志：', err || res.text);
					}
				} else {
					console.info('发送到“%s”成功！', friend.nick_name);
				}
			});
	},
	/**
	 * 调用群发（每天只有一次机会）
	 * @param msg 发送消息体
	 * @param cb 发送后的回调
	 */
	sendGroupMsg = function (msg, cb) {
		var sendParams = {
			type: 1,
			content: msg,
			error: false,
			tofakeid: friend.id,
			token: loginData.token,
			lang: 'zh_CN',
			f: 'json',
			ajax: 1,
			random: Math.random(),
			imgcode: ''
		};
		superAgent.post('https://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&f=json&token=' + loginData.token + '&lang=zh_CN')
			.type('form')
			.send(sendParams)
			.set('Cookie', loginData.cookie)
			.set('Referer', 'https://mp.weixin.qq.com/cgi-bin/singlesendpage?t=message/send&action=index&tofakeid=' + friend.id + '&token=' + loginData.token + '&lang=zh_CN')
			.end(function (err, res) {
				if (err || res.body.base_resp.ret != 0) {
					console.error('发送到“%s”失败！', friend.nick_name);
					if (res && res.body.base_resp.ret == 10706) {
						console.warn('用户“%s”已经超过48小时未联系，故无法发送消息！', friend.nick_name)
					} else {
						console.error('失败日志：', err || res.text);
					}
				} else {
					console.info('发送到“%s”成功！', friend.nick_name);
				}
			});
	};

exports.send = function (user, pwd, message, cb) {
	login(user, pwd, function (err) {
		if (err) {
			return cb && cb(err);
		}
		getFriendsList(function (err) {
			if (err) {
				return cb && cb(err);
			}
			friends.forEach(function (friend) {
				sendMsgToFriend(friend, message);
			});
			console.info('已经将需要发送的消息在后台进行对 %d 个用户发送', friends.length);
			return cb && cb();
		});
	});
};