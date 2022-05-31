# AUTH+JWT

## 任务目标

本节主要介绍如何使用 django-auth 组件和 JWT 组件配套使用。

我打算对内置的 user 表做扩展，添加头像字段。

用户在注册后会使用默认头像，只有手动登录并获取 JWT 后才能修改头像。

## 准备工作

首先创建执行以下命令创建目录，并且再找到一个默认头像丢进去：

```
$ mkdir -p media/avatar
$ cp /tmp/default.png ./media/avatar
```

对内置的 auth_user 表做扩展，代码如下：

```
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar = models.FileField(upload_to="avatar", default="avatar/default.png")
```

配置文件上传路径，声明 media 所在位置，以及声明我们对内置的 auth_user 表做了扩展：

```
MEDIA_ROOT = BASE_DIR / 'media'
AUTH_USER_MODEL = 'app01.User'
```

执行数据库迁移命令：

```
$ python3 manage.py makemigrations
$ python3 manage.py migrate
```

配置 urls，打开资源暴露接口：

```
from django.contrib import admin
from django.urls import path
from django.views.static import serve
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]
```

## 模型书写

### 新增用户

新增用户时需要二次密码验证，如下所示：

```
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from . import models


class UserRegisterSerializer(serializers.ModelSerializer):
    # 注册用户需要一个二次密码验证的字段
    re_password = serializers.CharField(max_length=20, write_only=True)

    class Meta:
        model = models.User
        fields = ('id', 'username', 'email', 'password', 're_password')
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        if models.User.objects.filter(email=validated_data['email']).exists():
            raise ValidationError("Email has been registered")

        if validated_data["password"] != validated_data.pop("re_password"):
            raise ValidationError("Inconsistent password input twice")

        user_object = models.User.objects.create_user(**validated_data)
        # 这里创建的用户密码会自动加密，因为我们是用的 auth 组件的 create_user 方法
        return user_object
```

### 修改头像

修改头像的模型序列器如下：

```
class UserChangeAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ("avatar", )
        extra_kwargs = {
            "avatar": {"write_only": True},
        }
```

## 视图书写

### 用户注册

用户注册的视图接口如下，我们直接使用 generics 的 CreateAPIView 扩展类即可：

```
from rest_framework.generics import CreateAPIView

from . import models
from . import serializers


class UserRegisterAPI(CreateAPIView):
    serializer_class = serializers.UserRegisterSerializer
    queryset = models.User.objects.all()
```

### 头像修改

头像修改的视图接口如下，我们使用 UpdateAPIView，并且覆写它的 patch 方法：

```
class UserChangeAvatarAPI(UpdateAPIView):
    serializer_class = serializers.UserChangeAvatarSerializer
    queryset = models.User.objects.all()

    def patch(self, request, *args, **kwargs):
        response_data = self.partial_update(request, *args, **kwargs)
        if response_data.status_code < 400:
            response_data.data = "Modify the avatar successfully"
        else:
            response_data.data = "Modify the avatar failed"
        return response_data
```

## JWT 使用

### 添加认证

由于我们目前的设置头像还没有添加任何认证，所以即使未登录用户也是可以访问的。

所以现在我们需要为 UserChangeAvatarAPI 类添加认证，这是局部使用的案例：

```
from rest_framework.permissions import IsAuthenticated  # 权限鉴定
from rest_framework_jwt.authentication import JSONWebTokenAuthentication  # 登录认证

class UserChangeAvatarAPI(UpdateAPIView):
    ...

    authentication_classes = [JSONWebTokenAuthentication]  # 用户必须提交 Token
    permission_classes = [IsAuthenticated]  # 用户必须已登录，不能是匿名用户

    ...
```

若想添加全局认证，则可以在 settings.py 中配置，它将作用于所有视图：

```
REST_FRAMEWORK = {
    # 认证模块
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES':{
    	'rest_framework.permissions.IsAuthenticated',
    }
}
```

如果你想取消某一个视图的认证，则可以对其认证类属性书写成空列表：

```
authentication_classes = []
permission_classes = []
```

### 路由书写

接下来是路由的书写，你可能会疑惑我们明明没有写登录接口啊，怎么写路由呢？

其实 JWT 模块已经帮我们写好了登录流程，只需要向下面这样配置即可：

```
from django.contrib import admin
from django.urls import path

from django.views.static import serve
from django.conf import settings

# 导入 JWT 书写好的登录认证视图
from rest_framework_jwt.views import obtain_jwt_token
# 内部实际上是 obtain_jwt_token = ObtainJSONWebToken.as_view()

from app01 import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # 直接使用 JWT 的登录认证视图
    path('login/', obtain_jwt_token),
    path('register/', views.UserRegisterAPI.as_view()),
    path('avatar/<int:pk>', views.UserChangeAvatarAPI.as_view()),
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]
```

# 代码测试

注册用户：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220524223927.png)

用户登录成功后会返回一个 token 字符串，记得将它记录下来：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220524224059.png)

修改头像时首先需要添加 Authorization 的请求头，并且 value 必须是 JWT + token 的形式：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220524230532.png)

然后再选择上传的头像即可，数据 Body 必须是 form-data 格式：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220524230518.png)

# 返回信息定制

在上面的示例中，用户使用 JWT 提供的登录接口登录后，返回信息只有一个 JWT 的 token 字符串。

我们是否可以将以登录的用户名称也返回呢？答案是可行的。

jwt_response_payload_handler 方法就是控制返回格式的，我们可以覆写它。

首先创建 utils 目录以及 jwt_response.py 文件：

```
$ mkdir ./utils
$ touch ./utils/jwt_response.py
```

在 jwt_response.py 中粘贴以下代码：

```
def jwt_response_payload_handler(token, user=None, request=None, issued_at=None):
    """
    自定义jwt认证成功返回数据
    """
    return {
        'pk': issued_at,
        'token': token,
        'username': user.username
    }
```

然后到 settings.py 中配置：

```
JWT_AUTH = {
    # 配置 JWT 过期时间
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=7),
    # 配置请求头里携带 token 的 key 前缀
    'JWT_AUTH_HEADER_PREFIX': 'JWT',
    # 配置 token 签发后的自定义的返回格式
    "JWT_RESPONSE_PAYLOAD_HANDLER": "utils.jwt_response.jwt_response_payload_handler",
}
```

最后登录成功的返回数据：

```
{
	"pk": 1653407800,
	"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFza2ZpeSIsImlhdCI6MTY1MzQwNzgwMCwiZXhwIjoxNjU0MDEyNjAwLCJqdGkiOiIyMDdiNmE3Zi1kZTZiLTQzNjYtOTIwYy1iZmE5ZmRhNjAzZTIiLCJ1c2VyX2lkIjoxLCJvcmlnX2lhdCI6MTY1MzQwNzgwMH0.R93Yg3CsWYphUehCESiyK3uK9RgLyGkkqE9LBqHW59Q",
	"username": "askfiy"
}
```
