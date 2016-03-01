status
|sina|sohu|digu|
|:---|:---|:---|
|id  |id  |id  |
|created\_at|created\_at|created\_at|
|text|text|text|
|source|source|source|
|favorited|favorited|favorited|
|truncated|truncated|truncated|
|in\_reply\_to\_status\_id|in\_reply\_to\_status\_id|in\_reply\_to\_status\_id|
|in\_reply\_to\_user\_id|in\_reply\_to\_user\_id|in\_reply\_to\_user\_id|
|in\_reply\_to\_screen\_name|in\_reply\_to\_screen\_name|in\_reply\_to\_screen\_name|
|thumbnail\_pic|small\_pic|thumbnail\_pic|
|bmiddle\_pic|middle\_pic|bmiddle\_pic|
|original\_pic|original\_pic|original\_pic|
|user|user|user|
|retweeted\_status|in\_reply\_to\_status\_text|retweeted\_status|

user
|sina|sohu|digu|zuosa|
|:---|:---|:---|:----|
|id  |id  |id  |id   |
|name|name(未使用，有可能会被作为个性域名使用)|name|name |
|screen\_name|screen\_name|screen\_name|screen\_name|
|province|-   |-   |province(名称)|
|city|-   |-   |city(名称)|
|location|-   |-   |location|
|description|description|description|description|
|url |url(个人主页（暂无）)|url |url(个人主页)|
|profile\_image\_url|profile\_image\_url|profile\_image\_url|profile\_image\_url|
|domain|-   |-   |-    |
|gender|-   |gender|gender|
|followers\_count|followers\_count|followers\_count|followers\_count|
|friends\_count|friends\_count|friends\_count|-    |
|statuses\_count|statuses\_count|statuses\_count|-    |
|favourites\_count|favourites\_count|favourites\_count|-    |
|created\_at|created\_at|created\_at|-    |
|following|following|following|-    |
|verified|verified|-   |-    |

comment
|sina|sohu|digu|
|:---|:---|:---|
|id  |id  |id  |
|text|text|text|
|source|source|source|
|favorited|favorited|favorited|
|truncated|truncated|truncated|
|created\_at|created\_at|created\_at|
|user|user|user|
|status|status|status|
|reply\_comment|-   |-   |

message
|sina|sohu|digu|
|:---|:---|:---|
|id  |id  |id  |
|text|text|text|
|sender\_id|sender\_id|sender\_id|
|recipient\_id|recipient\_id|recipient\_id|
|created\_at|created\_at|created\_at|
|sender\_screen\_name|sender\_screen\_name|sender\_screen\_name|
|recipient\_screen\_name|recipient\_screen\_name|recipient\_screen\_name|
|sender|sender|sender|
|recipient|recipient|recipient|
|-   |readed|-   |

# sina #
status: 微博信息内容，显示微博列表时会附带上微博的作者和转发的微博
```
created_at: 创建时间
id: 微博ID
text：微博信息内容
source: 微博来源
favorited: 是否已收藏(正在开发中，暂不支持)
truncated: 是否被截断
in_reply_to_status_id: 回复ID
in_reply_to_user_id: 回复人UID
in_reply_to_screen_name: 回复人昵称
thumbnail_pic: 缩略图
bmiddle_pic: 中型图片
original_pic：原始图片
user: 作者信息
retweeted_status: 转发的博文，内容为status，如果不是转发，则没有此字段
```

user: 用户资料信息，如查看用户资料或列表时，用户会包含最新status的子tag。
```
id: 用户UID
screen_name: 微博昵称
name: 友好显示名称，如Bill Gates(此特性暂不支持)
province: 省份编码（参考省份编码表）
city: 城市编码（参考城市编码表）
location：地址
description: 个人描述
url: 用户博客地址
profile_image_url: 自定义图像
domain: 用户个性化URL
gender: 性别,m--男，f--女,n--未知
followers_count: 粉丝数
friends_count: 关注数
statuses_count: 微博数
favourites_count: 收藏数
created_at: 创建时间
following: 是否已关注(此特性暂不支持)
verified: 加V标示，是否微博认证用户
```

comment: 评论信息描叙，会附带上评论的对象（微博/评论)
```
id: 评论ID
text: 评论内容
source: 评论来源
favorited: 是否收藏
truncated: 是否被截断
created_at: 评论时间
user: 评论人信息,结构参考user
status: 评论的微博,结构参考status
reply_comment 评论来源，数据结构跟comment一致
```

message: 私信说明：会返回私信的内容及发送者，接受者的用户资料（不包括微博信息）
```
id: 私信ID
text: 私信内容
sender_id：发送人UID
recipient_id: 接受人UID
created_at: 发送时间
sender_screen_name: 发送人昵称
recipient_screen_name：接受人昵称
sender: 发送人信息，参考user说明
recipient: 接受人信息，参考user说明
```



# sohu #
status:
```
created_at: 创建时间
id：微博id
text：内容
source：来源
favorited：是否收藏
truncated：暂无
==========下面四个字段仅在微博列表中有效：==========
in_reply_to_status_id：转发微博id
in_reply_to_user_id：转发微博作者id
in_reply_to_user_id：转发微博作者昵称
in_reply_to_status_text：转发微博内容
==========字段结束==========
small_pic: 小图
middle_pic：中图
original_pic：原图
user：user对象，参考第一部分user字段说明
```

user
```
id:用户id
name：姓名（未使用，有可能会被作为个性域名使用）
screen_name:昵称
location：地区（暂无）
description：个人简介
url：个人主页（暂无）
profile_image_url：用户头像
protected：勿扰（暂无）
followers_count：粉丝数
profile_background_color：背景颜色（暂无）
profile_text_color：文字颜色（暂无）
profile_sidebar_fill_color：侧栏颜色（暂无）
created_at：创建时间
favourites_count：收藏数
utc_offset：便宜（暂无）
time_zone：时区（暂无）
notifications：通知（暂无）
profile_background_image_url：暂无
geo_enabled：是否支持地理位置
statuses_count：微博数
following：是否关注
Verified：是否认证
lang：语言
contributors_enabled：暂无
```

message
```
id:私信id
created_at：创建时间
text：内容
sender_id：发送用户id
recipient_id：接收用户id
sender_screen_name：发送用户昵称
recipient_screen_name：接收用户昵称
sender:发送人基本信息（参考第一部分user）
recipient：接收人基本信息（参考第一部分user）
```

# digu #