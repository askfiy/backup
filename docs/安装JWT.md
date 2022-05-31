# 安装 JWT

## 插件安装

drf-jwt 是 djangorestframework 中的一款第三方插件，它为 djangorestframework 提供了开箱即用的 JWT 认证功能。

使用如下命令进行安装：

```
$ pip3 install drf-jwt
```

## 插件配置

安装插件后，需要将该插件注册为 Django 应用：

```
INSTALLED_APPS = [
    ...
    'rest_framework_jwt',
    'rest_framework_jwt.blacklist',
    ...
]
```

同 djangorestframework 相同， drf-jwt 会先去读取项目中 settings.py 的配置，再去读取自己自带的配置文件。

这意味着如果我们要配置 drf-jwt，则直接可以在项目的 settings.py 中书写配置。

```
import datetime

JWT_AUTH = {
    # 配置 JWT 过期时间
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=7),
    # 配置请求头里携带 token 的 key 前缀
    'JWT_AUTH_HEADER_PREFIX': 'JWT'
}
```

若你想了解更多配置，可查看该模块的默认配置文件：

```
from rest_framework_jwt import settings
```

查看其源代码，你可以发现它会先到项目全局的 settings.py 中找配置，然后再到局部的 settings.py 中找配置：

```
from django.conf import settings

USER_SETTINGS = getattr(settings, 'JWT_AUTH', None)

DEFAULTS = {
    ...
}

# 合并配置
api_settings = APISettings(None, DEFAULTS, IMPORT_STRINGS)
```
