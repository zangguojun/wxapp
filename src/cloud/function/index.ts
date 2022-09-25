import cloud from 'wx-server-sdk';

export const hello = async (frontend: string, backend: string) => {
  return `Hello ${frontend} & ${backend} at Wechat`;
};

export const getOpenId = async () => {
  const wechatContext = cloud.getWXContext();
  console.log('🚀~ 9 getOpenId wechatContext', wechatContext);
  return {
    openId: wechatContext.OPENID,
  };
};
