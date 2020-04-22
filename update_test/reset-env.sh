#!/bin/bash

echo "
export const environment = {
  production: true,
  exp_domain: '${ABTESTING_EXP_URL}',
  auth_domain: '${ABTESTING_AUTH_URL}',
  data_domain: '${ABTESTING_DATA_URL}',
  h5_domain: '${ABTESTING_H5_URL}',
  dataoffline_domain: '${ABTESTING_DTATOFFLINE_URL}',
  lpo_url: '${ABTESTING_LPO_URL}',
  old_ios_edit_url: 'http://abtesting.abtest.cn:9000/#/iosMobileEditor',
  old_android_edit_url: 'http://abtesting.abtest.cn:9000/#/mobileeditor',
  metrics_detail_domain: '${ABTESTING_NEW_DATA_URL}/metrics_detail',
  metrics_result_domain: '${ABTESTING_NEW_DATA_URL}/metrics_result',
  metrics_statistical_domain: '${ABTESTING_NEW_DATA_URL}/metrics_statistical_efficacy',
  cookie_domain: '${ABTESTING_DOMAIN_URL}',

  image_upload_domain: 'https://h5.appadhoc.com',
  socket_url: 'https://socket.appadhoc.com',

  new_android_edit_url: 'http://android-editor.dev.appadhoc.com/#/v1',
  ics_backend: 'http://ics-backend.dev.com',

  api_version: '5.0.0'
};
" > ./src/environments/environment.prod.ts
