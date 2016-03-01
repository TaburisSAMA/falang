http://code.google.com/p/falang/issues/detail?id=277

# 方案 #

1. bg启动的时候，获取黑名单用户id列表，缓存到本地，然后每小时同步一次。
2. 在用户详细tab，支持增加删除黑名单功能，打开用户详细页，也做黑名单用户判断，也同步此用户的黑名单数据。