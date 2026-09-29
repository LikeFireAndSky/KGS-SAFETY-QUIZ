import type { Messages } from "./ko";

const zh: Messages = {
  "lang.select": "选择语言",

  "home.region": "江原岭东",
  "home.appName": "燃气安全问答",
  "home.nav.categories": "分类",
  "home.nav.safetyInfo": "安全信息",
  "home.nav.start": "开始",
  "home.nav.openMenu": "打开菜单",
  "home.hero.badge": "✦ 江原岭东燃气安全问答 ✦",
  "home.hero.title1": "燃气安全",
  "home.hero.title2": "问答王 🏆",
  "home.hero.line1": "您对日常生活中的燃气安全了解多少？",
  "home.hero.line2": "通过{funQuiz}检验您的安全知识，挑战{quizKing}吧！",
  "home.hero.funQuiz": "有趣的问答",
  "home.hero.quizKing": "问答王",
  "home.startQuiz": "开始答题",
  "home.viewSafetyInfo": "查看安全信息",

  "home.tip.label": "安全提示",
  "home.tip.1": "💡 怀疑燃气泄漏时，请立即通风并远离火源",
  "home.tip.2": "🔒 外出前请务必确认燃气阀门已关闭",
  "home.tip.3": "📞 发生燃气事故时，请拨打119或韩国燃气安全公社（1544-4500）",
  "home.tip.4": "🔧 请定期由专业机构检查燃气设备",
  "home.tip.5": "⚠️ 请勿在燃气设备周围放置易燃物品",

  "home.categories.title": "问答分类",
  "home.categories.subtitle": "选择您想要的领域来挑战吧！",
  "home.cat.home.title": "家庭燃气安全",
  "home.cat.home.description": "在家中正确、安全使用燃气的方法",
  "home.cat.restaurant.title": "餐厅燃气安全",
  "home.cat.restaurant.description": "餐厅、饭店必须了解的燃气安全守则",
  "home.cat.rainy.title": "雨季燃气安全",
  "home.cat.rainy.description": "雨季遇到浸水、强风时必须了解的燃气安全守则",
  "home.cat.law.title": "安全规定与法规",
  "home.cat.law.description": "了解燃气相关的安全法规与标准",
  "home.badge.basic": "基础",
  "home.badge.season": "季节",
  "home.badge.advanced": "进阶",
  "home.card.done": "✓ 已完成",
  "home.card.comingSoon": "准备中",
  "home.card.questions": "{n}道题",
  "home.card.retry": "再次挑战",
  "home.card.challenge": "去挑战",
  "home.card.completedOn": "{score}/{total}分 · {date} 完成",

  "home.cta.title": "现在就来挑战吧！",
  "home.cta.subtitle": "测试您的燃气安全知识，养成安全使用燃气的习惯。",
  "home.footer.title": "江原岭东燃气安全问答",
  "home.footer.subtitle": "燃气安全问答王 · YeongDong Gas Safety",
  "home.footer.hotline": "📞 1544-4500（燃气泄漏举报 · 24小时）",
  "home.footer.copyright": "© 2026 江原岭东燃气安全问答. All rights reserved.",

  "quiz.loadingAria": "加载中",
  "quiz.loading": "正在加载问答…",
  "quiz.errorTitle": "无法加载问答。",
  "quiz.errorHint": "请检查网络状态后重试。",
  "quiz.retry": "重试",
  "quiz.backAria": "返回首页",
  "quiz.back": "首页",
  "quiz.oAria": "O（是）",
  "quiz.xAria": "X（否）",
  "quiz.imageAlt": "第{n}题相关图片",
  "quiz.correct": "✅ 回答正确！",
  "quiz.wrong": "❌ 回答错误！",
  "quiz.answerIs": "正确答案：{label}",
  "quiz.next": "下一题 →",
  "quiz.showResult": "查看结果 🏆",

  "result.scoreAria": "共{total}题，答对{score}题",
  "result.listAria": "各题结果",
  "result.answer": "答案：{answer}",
  "result.enterRaffle": "🎁 报名参加抽奖",
  "result.retry": "再次挑战 🔄",
  "result.home": "返回首页 🏠",
  "grade.perfect": "燃气安全问答王！",
  "grade.expert": "燃气安全专家！",
  "grade.great": "非常棒！",
  "grade.study": "再多学习一点吧",
  "grade.needTraining": "需要接受安全教育",

  "form.doneTitle": "报名成功！",
  "form.doneDesc": "如果中奖，我们将通过您填写的联系方式单独通知您。",
  "form.code": "参与编号",
  "form.codeHint": "请记下此编号。",
  "form.title": "抽奖报名",
  "form.subtitle": "如果中奖，奖品将寄送到您填写的地址。",
  "form.name": "姓名",
  "form.nameRequired": "请输入姓名。",
  "form.nameMin": "请输入至少2个字符。",
  "form.namePlaceholder": "洪吉童",
  "form.phone": "电话号码",
  "form.phoneRequired": "请输入电话号码。",
  "form.phonePattern": "请检查格式。（例：010-1234-5678）",
  "form.address": "地址",
  "form.addressRequired": "请搜索地址。",
  "form.addressPlaceholder": "请点击地址搜索按钮",
  "form.addressAria": "道路名地址",
  "form.addressSearch": "搜索地址",
  "form.addressDetailPlaceholder": "详细地址（栋、室号等）",
  "form.addressDetailAria": "详细地址",
  "form.privacyToggle": "查看个人信息收集与使用同意内容",
  "form.privacyText": `■ 个人信息收集与使用同意（必选）

收集项目 ：姓名、电话号码、地址
收集目的 ：抽选问答活动中奖者及寄送奖品
保存期限 ：活动结束3个月后销毁
委托内容 ：为配送目的向快递公司提供姓名、地址

🔒 所收集的个人信息仅用于领取奖品，
   绝不会用于其他任何目的
   （营销、宣传、向第三方提供等）。

※ 您有权拒绝上述同意，但拒绝后将无法参加活动。`,
  "form.privacyAgree": "我同意收集和使用个人信息。",
  "form.required": "（必选）",
  "form.privacyRequired": "请同意收集和使用个人信息。",
  "form.submitting": "提交中…",
  "form.submit": "提交报名 🎁",
};

export default zh;
