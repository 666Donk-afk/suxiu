/**
 * 各省官方文旅预约渠道（仅保留可实际预约的链接）
 * reservationType:
 *   qr   — 二维码指向公众号预约指引 / 官方票务页（微信内可扫码直达）
 *   mini — 无可靠外链时，引导微信搜索官方小程序预约（不生成无效政务门户二维码）
 */
module.exports = {
  湖北: {
    officialMiniProgram: '游湖北',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/6SU1Lo9l4R2QlyoC8u3lPw',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码进入「湖北发布」官方预约指引，或微信搜索「游湖北」小程序预约文化场馆与非遗体验。',
      'en-US': 'Scan for the official Hubei booking guide, or search "游湖北" in WeChat.'
    }
  },
  北京: {
    officialMiniProgram: '中国工美馆 中国非遗馆',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/-sBwjCtxKtw7isexQd7aSg',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看中国工艺美术馆官方预约流程，或关注「中国工美馆 中国非遗馆」公众号 → 预约 → 个人预约。',
      'en-US': 'Scan for museum booking steps, or follow the official WeChat account to book.'
    }
  },
  天津: {
    officialMiniProgram: '津游天津',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「津游天津」小程序，选择文旅场馆或活动进行实名预约。',
      'en-US': 'Search "津游天津" in WeChat to book cultural venues and events.'
    }
  },
  河北: {
    officialMiniProgram: '冀云文旅',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「冀云文旅」或目标景区官方小程序，按页面提示完成预约。',
      'en-US': 'Search "冀云文旅" or the venue\'s official mini program in WeChat to book.'
    }
  },
  山西: {
    officialMiniProgram: '游山西',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「游山西」小程序，进入个人中心 → 前往预约，选择场馆与日期。',
      'en-US': 'Search "游山西" in WeChat, go to Profile → Book, and select a venue.'
    }
  },
  内蒙古: {
    officialMiniProgram: '智游内蒙古',
    reservationType: 'mini',
    openTime: '09:00-17:30',
    notice: {
      'zh-CN': '微信搜索「智游内蒙古」小程序预约景区与文化场馆。',
      'en-US': 'Search "智游内蒙古" in WeChat for scenic and cultural venue booking.'
    }
  },
  辽宁: {
    officialMiniProgram: '乐游辽宁',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「乐游辽宁」小程序，查看非遗体验与文旅场馆预约入口。',
      'en-US': 'Search "乐游辽宁" in WeChat for heritage experiences and venue booking.'
    }
  },
  吉林: {
    officialMiniProgram: '智游吉林',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「智游吉林」小程序预约文旅场馆与活动。',
      'en-US': 'Search "智游吉林" in WeChat to book cultural venues.'
    }
  },
  黑龙江: {
    officialMiniProgram: '一键玩龙江',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「一键玩龙江」小程序，支持非遗之旅与景区门票预约。',
      'en-US': 'Search "一键玩龙江" in WeChat for heritage tours and ticket booking.'
    }
  },
  上海: {
    officialMiniProgram: '随申办·文旅通',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/7X0wuCMNoYbUQUJI_uKAMw',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看「随申办·文旅通」预约指南，或微信搜索「随申办」→ 文旅通预约景点。',
      'en-US': 'Scan for the 随申办 culture & tourism booking guide, or search 随申办 in WeChat.'
    }
  },
  江苏: {
    officialMiniProgram: '云上博物',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「云上博物」或「水韵江苏预约平台」小程序，进入参观预约；也可关注目标博物馆官方公众号预约。',
      'en-US': 'Search "云上博物" or the venue\'s official account in WeChat to book.'
    }
  },
  浙江: {
    officialMiniProgram: '游浙里',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/4JpF5pqlrtqDs0qgLLLFVw',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码进入浙里办「游浙里/入馆预约」指引，或微信搜索「游浙里」「云上浙博」预约。',
      'en-US': 'Scan for Zhejiang booking guide, or search 游浙里 / 云上浙博 in WeChat.'
    }
  },
  安徽: {
    officialMiniProgram: '游安徽',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「游安徽」小程序预约文化场馆，或关注目标景区/博物馆官方公众号。',
      'en-US': 'Search "游安徽" or the venue official account in WeChat to book.'
    }
  },
  福建: {
    officialMiniProgram: '清新福建文旅惠民卡',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/HDbRCj6z4jlmzXTuhqDKhg',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看「清新福建文旅惠民卡」预约流程，或微信搜索该小程序 → 预约出行。',
      'en-US': 'Scan for Fujian booking steps, or search 清新福建文旅惠民卡 in WeChat.'
    }
  },
  江西: {
    officialMiniProgram: '云游江西',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「云游江西」小程序预约景区与文化场馆。',
      'en-US': 'Search "云游江西" in WeChat for venue booking.'
    }
  },
  山东: {
    officialMiniProgram: '云游齐鲁',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/Y2y7NinFVIZcGHXCzqwnHA',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看山东文旅官方预约提示，或微信搜索「云游齐鲁」/「爱山东」预约景区门票。',
      'en-US': 'Scan for Shandong booking info, or search 云游齐鲁 in WeChat.'
    }
  },
  河南: {
    officialMiniProgram: '河南文旅通',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/KmQqZAPj39-6TL7PT_lpng',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看「河南文旅通」预约流程，或微信搜索「河南文旅通」「一机游河南」小程序预约。',
      'en-US': 'Scan for Henan booking guide, or search 河南文旅通 / 一机游河南 in WeChat.'
    }
  },
  湖南: {
    officialMiniProgram: '云游潇湘',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「云游潇湘」或目标景区官方公众号（如岳麓山橘子洲旅游区）进行实名预约。',
      'en-US': 'Search 云游潇湘 or the scenic area official account in WeChat to book.'
    }
  },
  广东: {
    officialMiniProgram: '文化广东',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/R50KZzsbFYKW_oNtrKShdw',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看广东省博物馆预约攻略，或微信搜索「文化广东」小程序 → 参观预约。',
      'en-US': 'Scan for Guangdong museum booking guide, or search 文化广东 in WeChat.'
    }
  },
  广西: {
    officialMiniProgram: '一键游广西',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「一键游广西」小程序预约景区与文化体验。',
      'en-US': 'Search "一键游广西" in WeChat for bookings.'
    }
  },
  海南: {
    officialMiniProgram: '智游海南',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「智游海南」小程序预约文旅场馆与活动。',
      'en-US': 'Search "智游海南" in WeChat for venue booking.'
    }
  },
  重庆: {
    officialMiniProgram: '惠游重庆',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「惠游重庆」小程序预约文化场馆与非遗相关体验。',
      'en-US': 'Search "惠游重庆" in WeChat for cultural bookings.'
    }
  },
  四川: {
    officialMiniProgram: '智游天府',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/ctHMH8rgeAaiuwT_y9okcg',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看四川景区预约指引，或微信搜索目标景区官方小程序（如九寨沟、峨眉山）预约。',
      'en-US': 'Scan for Sichuan scenic booking guide, or search the venue mini program in WeChat.'
    }
  },
  贵州: {
    officialMiniProgram: '一码游贵州',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/fOHr5RMmh4q6mGg0aq5oPQ',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看「一码游贵州」预约流程，或微信搜索该小程序 → 景区门票预约。',
      'en-US': 'Scan for 一码游贵州 booking steps, or search the mini program in WeChat.'
    }
  },
  云南: {
    officialMiniProgram: '游云南',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/YrIcz3c5I2-okVM895CfFg',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码进入「云南发布」游云南预约入口指引，或微信搜索「游云南」小程序 → 景区预约。',
      'en-US': 'Scan for Yunnan booking guide, or search 游云南 in WeChat.'
    }
  },
  西藏: {
    officialMiniProgram: '游西藏',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「游西藏」小程序了解并预约文化场馆。',
      'en-US': 'Search "游西藏" in WeChat for cultural venue booking.'
    }
  },
  陕西: {
    officialMiniProgram: '游陕西',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「游陕西」小程序，或关注陕西历史博物馆等目标场馆官方公众号预约。',
      'en-US': 'Search 游陕西 or the museum official account in WeChat to book.'
    }
  },
  甘肃: {
    officialMiniProgram: '一部手机游甘肃',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/AY-bEdFWpiTsB2kDIrDIiQ',
    reservationType: 'qr',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '扫码查看甘肃省博物馆预约方式，或微信搜索「这里是甘博」/「甘肃省博物馆」公众号预约。',
      'en-US': 'Scan for Gansu museum booking guide, or follow the museum official account.'
    }
  },
  青海: {
    officialMiniProgram: '游青海',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「游青海」小程序预约文旅项目。',
      'en-US': 'Search "游青海" in WeChat for bookings.'
    }
  },
  宁夏: {
    officialMiniProgram: '游宁夏',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '微信搜索「游宁夏」小程序预约文化体验与景区。',
      'en-US': 'Search "游宁夏" in WeChat for cultural experience booking.'
    }
  },
  新疆: {
    officialMiniProgram: '游新疆',
    reservationType: 'mini',
    openTime: '09:00-17:30',
    notice: {
      'zh-CN': '微信搜索「游新疆」小程序预约文旅与非遗相关项目。',
      'en-US': 'Search "游新疆" in WeChat for heritage-related bookings.'
    }
  },
  台湾: {
    officialMiniProgram: '',
    reservationType: 'mini',
    openTime: '09:00-17:00',
    notice: {
      'zh-CN': '请通过当地非遗保护机构或文化场馆官方渠道查询并预约体验。',
      'en-US': 'Contact local heritage institutions or cultural venues for booking.'
    }
  },
  香港: {
    officialMiniProgram: '',
    reservationType: 'mini',
    openTime: '10:00-18:00',
    notice: {
      'zh-CN': '请通过相关文化场馆或非遗机构的官方网站/公众号预约。',
      'en-US': 'Book through official venue websites or social accounts.'
    }
  },
  澳门: {
    officialMiniProgram: '',
    reservationType: 'mini',
    openTime: '10:00-18:00',
    notice: {
      'zh-CN': '请通过相关文化场馆或非遗机构的官方网站/公众号预约。',
      'en-US': 'Book through official venue websites or social accounts.'
    }
  }
};
