// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {

  production: true,
  testing: true,
  exp_domain: 'http://experiment-control.dev.com',
  auth_domain: 'http://auth.dev.com',
  data_domain: 'http://data.dev.com',
  h5_domain: 'https://h5.dev.com',
  dataoffline_domain: 'http://data-offline.dev.com',
  lpo_url: 'http://lpo.abtest.cn:4300',
  old_ios_edit_url: 'http://abtesting.abtest.cn:9000/#/iosMobileEditor',
  old_android_edit_url: 'http://abtesting.abtest.cn:9000/#/mobileeditor',
  metrics_detail_domain: 'http://new-data-api.dev.com/metrics_detail',
  metrics_result_domain: 'http://new-data-api.dev.com/metrics_result',
  metrics_statistical_domain: 'http://new-data-api.dev.com/metrics_statistical_efficacy',
  cookie_domain: 'dev.com',

  new_android_edit_url: 'http://android-editor.dev.com/#/v1',
  new_ios_edit_url: 'http://ios-editor.dev.com/#/v1',
  ics_backend: 'http://ics-backend.dev.com',

  api_version: '5.0.0'
};

