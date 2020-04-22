# adhoc-ng-api

export USERNAME="admin"
export PASSWORD="adhoc23462"
export EMAIL="admin@example.com"

npm config set registry http://registry-prod.appadhoc.com:30080/repository/npm-all/
/usr/bin/expect <<EOD
spawn npm adduser --registry=http://registry-prod.appadhoc.com:30080/repository/npm-all/
expect {
  "Username:" {send "$USERNAME\r"; exp_continue}
  "Password:" {send "$PASSWORD\r"; exp_continue}
  "Email: (this IS public)" {send "$EMAIL\r"; exp_continue}
}
EOD

npm install adhoc-api
npm config set registry http://registry.npm.taobao.org/
#cnpm install #TODO: deprecate?
