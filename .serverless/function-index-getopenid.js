const { BootstrapStarter } = require('@midwayjs/bootstrap');
const { Framework } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('@midwayjs/serverless-scf-starter');
const { match } = require('path-to-regexp');

const layers = [];


let frameworkInstance;
let runtime;
let initStatus = 'uninitialized';
let initError;

const initializeMethod = async (initializeContext = {}) => {
  initStatus = 'initialing';
  layers.unshift(engine => {
    engine.addRuntimeExtension({
      async beforeFunctionStart(runtime) {
        let startConfig = {
          initializeContext,
          preloadModules: [],
          applicationAdapter: runtime
        };
        let applicationContext;
        

        frameworkInstance = new Framework();
        frameworkInstance.configure({
          initializeContext,
          preloadModules: [],
          applicationAdapter: runtime
        });
        const boot = new BootstrapStarter();
        boot.configure({
          appDir: __dirname,
          applicationContext,
        }).load(frameworkInstance);

        await boot.init();
        await boot.run();
      }
    });
  })
  runtime = await start({
    layers: layers,
    initContext: initializeContext,
    runtimeConfig: {"service":{"name":"midway-hooks-wechat"},"provider":{"name":"wechat"},"functions":{"function-index-hello":{"handler":"function-index-hello.handler","events":[{"event":true}]},"function-index-getopenid":{"handler":"function-index-getopenid.handler","events":[{"event":true}]}},"package":{"include":["config.json","sitemap.json"]},"globalDependencies":{"@midwayjs/serverless-scf-starter":"*"}},
  });

  initStatus = 'initialized';
};

const getHandler = (hanlderName, ...originArgs) => {
  
    if (hanlderName === 'handler') {
      return  frameworkInstance.handleInvokeWrapper('function-index-getopenid.handler'); 
    }
  
}

exports.initializer = asyncWrapper(async (...args) => {
  console.log(`initializer: process uptime: ${process.uptime()}, initStatus: ${initStatus}`);
  if (initStatus === 'initializationError') {
    console.error('init failed due to init status is error, and that error is: ' + initError);
    console.error('FATAL: duplicated init! Will exit with code 121.');
    process.exit(121);
  }
  if (initStatus === 'initialized') {
    console.warn('skip init due to init status is initialized');
    return;
  }
  if (initStatus !== 'uninitialized') {
    throw new Error('init failed due to init status is ' + initStatus);
  }
  try {
    await initializeMethod(...args);
  } catch (e) {
    initStatus = 'initializationError';
    initError = e;
    throw e;
  }
});



exports.handler = asyncWrapper(async (...args) => {
  
  if(initStatus !== 'initialized') {
    throw new Error('invoke failed due to init status is ' + initStatus);
  }

  const handler = getHandler('handler', ...args);
  return runtime.asyncEvent(handler)(...args);
});

