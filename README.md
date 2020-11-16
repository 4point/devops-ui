# Deploy on staging environment
1. <code> GIT_COMMIT_ID=$(git rev-parse HEAD) </code>
1. <code> echo "VUE_APP_VERSION='${GIT_COMMIT_ID}'" >> .env.staging </code>
1. <code> npm install </code>
1. <code> npm run build:stage </code>
1. <code> docker build . --tag iiiorg/devops-ui:version </code>
1. <code> docker push iiiorg/devops-ui:version </code>
1. Edit <code> k8s-yaml/devopswebui-deployment.yaml </code>, Replace image version
1. <code> kubectl apply -f k8s-yaml/devopswebui-deployment.yaml --kubeconfig ~/.kube/stage_config </code>

# Deploy on production environment
1. <code> GIT_COMMIT_ID=$(git rev-parse HEAD) </code>
1. <code> echo "VUE_APP_VERSION='${GIT_COMMIT_ID}'" >> .env.production </code>
1. <code> npm install </code>
1. <code> npm run build:prod </code>
1. <code> docker build . --tag iiiorg/devops-ui:prod-${GIT_COMMIT_ID} </code>
1. <code> docker push iiiorg/devops-ui:prod-${GIT_COMMIT_ID} </code>
1. Switch to deploy-devops projeact
1. Edit <code> deploy-devops/devops-ui/k8s-yaml/devopsui-deployment.yaml </code>, Replace image version
1. <code> kubectl apply -f k8s-yaml/devopsui-deployment.yaml --kubeconfig ~/.kube/prod_config  </code>

# vue-admin-template

English | [简体中文](./README-zh.md)

> A minimal vue admin template with Element UI & axios & iconfont & permission control & lint

**Live demo:** http://panjiachen.github.io/vue-admin-template

**The current version is `v4.0+` build on `vue-cli`. If you want to use the old version , you can switch branch to [tag/3.11.0](https://github.com/PanJiaChen/vue-admin-template/tree/tag/3.11.0), it does not rely on `vue-cli`**

## Build Setup

```bash
# clone the project
git clone https://github.com/PanJiaChen/vue-admin-template.git

# enter the project directory
cd vue-admin-template

# install dependency
npm install
```

## Develop Setup

Before running project in development mode, please setup your environment variable `VUE_APP_DEV_PROXY_URL` for API request in the `.env.development` file.

```
npm run dev
```

This will automatically open http://localhost:9528

## Build

```bash
# build for test environment
npm run build:stage

# build for production environment
npm run build:prod
```

## Advanced

```bash
# preview the release environment effect
npm run preview

# preview the release environment effect + static resource analysis
npm run preview -- --report

# code format check
npm run lint

# code format check and auto fix
npm run lint -- --fix
```

Refer to [Documentation](https://panjiachen.github.io/vue-element-admin-site/guide/essentials/deploy.html) for more information

## Demo

![demo](https://github.com/PanJiaChen/PanJiaChen.github.io/blob/master/images/demo.gif)

## Extra

If you want router permission && generate menu by user roles , you can use this branch [permission-control](https://github.com/PanJiaChen/vue-admin-template/tree/permission-control)

For `typescript` version, you can use [vue-typescript-admin-template](https://github.com/Armour/vue-typescript-admin-template) (Credits: [@Armour](https://github.com/Armour))

## Related Project

- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)

- [electron-vue-admin](https://github.com/PanJiaChen/electron-vue-admin)

- [vue-typescript-admin-template](https://github.com/Armour/vue-typescript-admin-template)

- [awesome-project](https://github.com/PanJiaChen/vue-element-admin/issues/2312)

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE10, IE11, Edge                                                                                                                                                                                                | last 2 versions                                                                                                                                                                                                   | last 2 versions                                                                                                                                                                                               | last 2 versions                                                                                                                                                                                               |
