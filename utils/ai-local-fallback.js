/**
 * AI 助手离线降级：后端不可用时基于本地非遗数据回复
 */
const { getAllHeritages, getHeritagesByCity } = require('../data/heritages');
const { getPersonalizedHeritages, getPersonalizedExperiences } = require('./recommendation');
const { isRouteIntent, isStoryIntent } = require('./ai-intent');

const OFFLINE_HINT = {
  'zh-CN': '\n\n— 当前为离线导览，回复来自本地资料库。',
  'en-US': '\n\n— Offline guide mode: answers are from the local catalog.'
};

function offlineHint(locale) {
  return OFFLINE_HINT[locale] || OFFLINE_HINT['zh-CN'];
}

function pickHeritages(message, userContext, locale, limit) {
  const loc = locale || 'zh-CN';
  const city = userContext && userContext.journey && userContext.journey.selectedCity;
  const text = (message || '').trim().toLowerCase();
  let pool = getPersonalizedHeritages(24, loc);

  if (!pool.length) {
    pool = getAllHeritages(loc).slice(0, 24);
  }

  if (city && text.length <= 4) {
    const cityItems = getHeritagesByCity(city, loc);
    if (cityItems.length) pool = [...cityItems, ...pool];
  }

  const scored = pool.map(h => {
    let score = 0;
    const name = (h.name || '').toLowerCase();
    const category = (h.category || '').toLowerCase();
    const summary = (h.summary || '').toLowerCase();
    if (text && name.includes(text)) score += 80;
    if (text && text.includes(name) && name.length > 1) score += 60;
    if (text && category.includes(text)) score += 40;
    if (text && summary.includes(text)) score += 20;
    text.split(/\s+/).filter(Boolean).forEach(word => {
      if (word.length < 2) return;
      if (name.includes(word)) score += 15;
      if (category.includes(word)) score += 10;
    });
    return { heritage: h, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0] && scored[0].score > 0 ? scored[0].heritage : pool[0];
  const rest = scored.filter(s => s.heritage.id !== top.id).map(s => s.heritage);
  return [top, ...rest].filter(Boolean).slice(0, limit || 4);
}

function localChat(message, userContext, locale, options) {
  const loc = locale || 'zh-CN';
  const text = (message || '').trim();

  if (options && options.imageBase64) {
    return {
      success: true,
      reply: loc === 'en-US'
        ? 'Offline mode cannot analyze images yet. Try text questions or start the AI backend for vision features.'
        : '离线模式下暂不支持图片理解，你可以文字提问；如需识图请部署并启动 AI 后端服务。',
      fallback: true
    };
  }

  if (isRouteIntent(text, options && options.intent)) {
    return localPlanRoute(text, userContext, loc);
  }

  if ((options && options.intent === 'story') || isStoryIntent(text, options && options.intent)) {
    return localStory(text, userContext, loc);
  }

  return localKnowledge(text, userContext, loc);
}

function localKnowledge(message, userContext, locale) {
  const loc = locale || 'zh-CN';
  const city = userContext && userContext.journey && userContext.journey.selectedCity;
  const picks = pickHeritages(message, userContext, loc, 3);
  const main = picks[0];

  if (!main) {
    return {
      success: true,
      reply: (loc === 'en-US'
        ? 'No matching heritage found in the local catalog. Try another keyword.'
        : '本地资料库中暂未找到匹配项，请换个关键词试试。') + offlineHint(loc),
      fallback: true
    };
  }

  const others = picks.slice(1).map(h => h.name).filter(Boolean);
  const location = [main.city, main.province].filter(Boolean).join(' · ');

  let reply;
  if (loc === 'en-US') {
    reply = `About **${main.name}** (${main.category || 'heritage'})\n${location}\n\n${main.summary || ''}`;
    if (others.length) reply += `\n\nYou may also explore: ${others.join('、')}.`;
  } else {
    reply = `关于「${main.name}」（${main.category || '非遗'}）\n${location}\n\n${main.summary || ''}`;
    if (others.length) reply += `\n\n你还可以了解：${others.join('、')}。`;
    if (city && main.city !== city) {
      reply = `结合你关注的「${city}」，为你介绍：\n\n${reply}`;
    }
  }

  return { success: true, reply: reply + offlineHint(loc), fallback: true };
}

function localStory(message, userContext, locale) {
  const loc = locale || 'zh-CN';
  const main = pickHeritages(message, userContext, loc, 1)[0];
  if (!main) return localKnowledge(message, userContext, locale);

  const reply = loc === 'en-US'
    ? `Legend of ${main.name}\n\nLong ago in ${main.city || 'this land'}, people passed down ${main.name} from generation to generation. ${main.summary || ''}\n\nEvery craft and performance carries the memory of its community — worth seeing in person when you visit.`
    : `【${main.name}】\n\n相传在${main.city || '当地'}，${main.name}代代相传。${main.summary || '这一项非遗承载着一方水土的记忆与技艺。'}\n\n若有机会亲临现场，更能感受其中的温度与匠心。`;

  return { success: true, reply: reply + offlineHint(loc), fallback: true, mode: 'story' };
}

function localPlanRoute(message, userContext, locale) {
  const loc = locale || 'zh-CN';
  const city = (userContext && userContext.journey && userContext.journey.selectedCity) || (loc === 'en-US' ? 'your city' : '当地');
  const heritages = pickHeritages(message, userContext, loc, 4);
  const experiences = getPersonalizedExperiences(2, loc);

  const steps = [];
  heritages.forEach(h => {
    if (!h) return;
    steps.push({
      name: h.name,
      description: loc === 'en-US'
        ? `${h.category || 'Heritage'} · ${h.city || ''}. ${(h.summary || '').slice(0, 80)}`
        : `${h.category || '非遗'} · ${h.city || ''}。${(h.summary || '').slice(0, 80)}`
    });
  });

  experiences.forEach(exp => {
    if (!exp || steps.length >= 5) return;
    steps.push({
      name: exp.title,
      description: loc === 'en-US'
        ? `Experience · ${exp.location || ''}. ${(exp.description || '').slice(0, 80)}`
        : `线下体验 · ${exp.location || ''}。${(exp.description || '').slice(0, 80)}`
    });
  });

  if (!steps.length) {
    return localKnowledge(message, userContext, locale);
  }

  return {
    success: true,
    route: {
      title: loc === 'en-US' ? `${city} Heritage Route` : `${city}非遗体验路线`,
      duration: loc === 'en-US' ? 'Half day' : '半天',
      reason: loc === 'en-US'
        ? `Curated from local heritage data based on your preferences in ${city}.`
        : `根据你在「${city}」的偏好，从本地非遗资料中为你整理的推荐路线。`,
      steps: steps.slice(0, 5)
    },
    fallback: true
  };
}

function localRecognize(imageBase64, mimeType, userContext, locale) {
  const loc = locale || 'zh-CN';
  const main = pickHeritages('', userContext, loc, 1)[0];
  if (!main) {
    return {
      success: true,
      heritage: null,
      reply: (loc === 'en-US'
        ? 'Offline mode cannot identify images. Start the AI backend for photo recognition.'
        : '离线模式无法识图，请启动 AI 后端服务后重试。') + offlineHint(loc),
      fallback: true
    };
  }

  return {
    success: true,
    heritage: {
      id: main.id,
      name: main.name,
      category: main.category,
      categoryKey: main.categoryKey,
      location: [main.city, main.province].filter(Boolean).join(' · '),
      summary: (main.summary || '').slice(0, 160),
      confidence: 'low'
    },
    confidence: 'low',
    reply: (loc === 'en-US'
      ? 'Offline mode: here is a related heritage item for reference (not from image analysis).'
      : '离线模式下无法准确识图，为你推荐一项相关非遗供参考：') + offlineHint(loc),
    fallback: true
  };
}

module.exports = {
  localChat,
  localPlanRoute,
  localRecognize
};
