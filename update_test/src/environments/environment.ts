// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  testing: true,

  exp_domain: 'https://experiment-control.appadhoc.com',
  auth_domain: 'https://auth.appadhoc.com',
  data_domain: 'https://data.appadhoc.com',
  h5_domain: 'https://h5.appadhoc.com',
  dataoffline_domain: 'https://data-offline.appadhoc.com',
  lpo_url: 'http://lpo.abtest.cn:4300',

  old_ios_edit_url: 'https://abtesting.appadhoc.com/#/iosMobileEditor',
  old_android_edit_url: 'https://abtesting.appadhoc.com/#/mobileeditor',
  metrics_detail_domain: 'https://new-data-api.appadhoc.com/metrics_detail',
  metrics_result_domain: 'https://new-data-api.appadhoc.com/metrics_result',
  metrics_statistical_domain: 'https://new-data-api.appadhoc.com/metrics_statistical_efficacy',


  cookie_domain: 'abtest.cn',

  image_upload_domain: 'http://h5.appadhoc.com',
  socket_url: 'https://socket.appadhoc.com',

  new_ios_edit_url: 'http://ios-editor.dev.com/#/v1',
  new_android_edit_url: 'http://android-edit.abtest.cn:4300/#/v1',
  ics_backend: "https://ics-api.appadhoc.com",

  api_version: '5.0.0'

};

