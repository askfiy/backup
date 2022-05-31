# djangorestframework

## 模块安装

djangorestframework 是一款 Django 的扩展插件，旨在能够让我们更加方便、快速编写出符合 RestFramework 规范的 API 接口。

使用 pip 命令安装 djangorestframework，如安装失败，可尝试降低 djangorestframework 的版本：

```
$ pip3 install djangorestframework
```

安装过程中遇见的任何问题，可至 [djangorestframework](https://www.django-rest-framework.org/) 官网获得帮助。

## 基本使用

### 注册 drf

djangorestframework 下载完成后，需要在 settings.py 文件中注册 rest_framework：

```
INSTALLED_APPS = [
    '...',
    'rest_framework'
]
```

### 创建模型表

在 models 中创建一个模型表：

```
from django.db import models

# Create your models here.


class UserInfo(models.Model):
    name = models.CharField(max_length=32, null=False, verbose_name="用户名")
    gender = models.BooleanField(
        choices=(
            (0, "female"),
            (1, "male")
        ),
        null=False,
        default=1,
        verbose_name="用户性别"
    )
    introduction = models.TextField(
        max_length=1024, null=True, default="", blank=True, verbose_name="用户简介"
    )

    def __str__(self):
        return f"{self.pk}-{self.name}"
```

执行以下 2 条命令，在数据库中生成物理表：

```
$ python3 manage.py makemigrations
$ python3 manage.py migrate
```

### 创建序列化类

由于我们的后端只从 API 接口返回数据，所以需要将数据库表中的记录进行序列化。

那么现在让我们新建一个序列化类，在 app01（项目应用） 下新建 serializers.py 文件，并填入以下内容：

```
from .models import UserInfo  # 导入 UserInfo 模型类
from rest_framework.serializers import ModelSerializer  # 导入 ModelSerializer


class UserInfoSerializer(ModelSerializer):  # 定义序列化器类，该类继承 ModelSerializer
    class Meta:
        model = UserInfo  # 指定序列化器类对应的模型类
        fields = '__all__'  # 指定序列化器类需要序列化的字段
```

### 书写 API

接下来就可以书写 API 了，视图统一采用 CBV 形式书写：

```
from .models import UserInfo  # 导入 UserInfo 模型类
from .serializers import UserInfoSerializer  # 导入 UserInfoSerializer 序列化器类
from rest_framework.viewsets import ModelViewSet  # 导入 ModelViewSet 视图集


class UserInfoViewSet(ModelViewSet):  # 继承 ModelViewSet 视图集
    queryset = UserInfo.objects.all()  # 设置 queryset
    serializer_class = UserInfoSerializer  # 设置序列化器类
```

### 书写路由

接下来进行路由的书写，路由规则需要写在 rest_framework 插件所提供的路由器中，然后再将它合并到 Django 路由：

```
from django.contrib import admin
from django.urls import path
from django.urls import include

# 导入 rest_framework 所提供的 DefaultRouter 类
from rest_framework.routers import DefaultRouter
from app01 import views


router = DefaultRouter()  # 实例化 DefaultRouter 类
router.register(r'user', views.UserInfoViewSet)  # 注册 UserInfoViewSet 类

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include(router.urls)),  # 将 router.urls 注册到 urlpatterns 中（合并路由）
]
```

user 的接口地址为：

```
http://host:port/api/user/
```

## 接口测试

### 新建用户

使用 APIPost 发起 POST 请求，创建 1 个新用户（发送 POST 请求时，需要选择 BODY 体为 JSON 格式）。

目前只能一个一个创建，如果需要创建多个用户，还需要我们学习后面的自定义序列化器。

```
POST http://127.0.0.1:8000/api/user/

-- 第一次
{
    "id": 1,
    "name": "user01",
    "gender": 0,
    "introduction": "my name is user01"
}

-- 第二次
{
    "id": 2,
    "name": "user02",
    "gender": 0,
    "introduction": "my name is user02"
}

-- 第三次
{
    "id": 3,
    "name": "user03",
    "gender": 0,
    "introduction": "my name is user03"
}
```

每次创建完成后，都会将新增的记录返回，下面是第三次创建完成后的返回信息：

```
{
    "id": 3,
    "name": "user03",
    "gender": 0,
    "introduction": "my name is user03"
}
```

### 获取所有

使用 APIPost 发起 GET 请求，获取所有用户：

```
GET http://127.0.0.1:8000/api/user/
```

返回结果：

```
[
	{
		"id": 1,
		"name": "user01",
		"gender": false,
		"introduction": "my name is user01"
	},
	{
		"id": 2,
		"name": "user02",
		"gender": false,
		"introduction": "my name is user02"
	},
	{
		"id": 3,
		"name": "user03",
		"gender": false,
		"introduction": "my name is user03"
	}
]
```

### 获取单个

使用 APIPost 发起 GET 请求，获取指定 id 的用户：

```
GET http://127.0.0.1:8000/api/user/1/
```

返回结果：

```
{
	"id": 1,
	"name": "user01",
	"gender": false,
	"introduction": "my name is user01"
}
```

### 修改用户

使用 APIPost 发起 PUT 请求，修改用户的数据（注意！PUT 请求修改用户数据时，需要将未修改的字段也一起传入）：

```
PUT http://127.0.0.1:8000/api/user/2/

{
	"id": 2,                    # 即使 id 未修改，也需要传入
	"name": "user02_change",    # name 修改了
	"gender": 0,                # 即使 gender 未修改，也需要传入
	"introduction": "my name is user02"  # 即使 introduction 未修改，也需要传入
}
```

返回结果：

```
{
	"id": 2,
	"name": "user02_change",
	"gender": 0,
	"introduction": "my name is user02"
}
```

使用 APIPost 发起 PATCH 请求，修改用户的数据（注意！PATCH 请求修改用户数据时，只需要传入修改后的字段）：

```
PATCH http://127.0.0.1:8000/api/user/3/

{
    "name": "user03_change"
}
```

返回结果：

```
{
	"id": 3,
	"name": "user03_change",
	"gender": false,
	"introduction": "my name is user03"
}
```

### 删除用户

使用 APIPost 发起 DELETE 请求，删除用户的数据：

```
DELETE http://127.0.0.1:8000/api/user/1/
DELETE http://127.0.0.1:8000/api/user/2/
DELETE http://127.0.0.1:8000/api/user/3/
```

没有任何返回值。
