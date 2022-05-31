# 使用 Serializer 自定义序列器

## 序列化

### 创建自定义序列器

在应用目录中新建 serializers.py 文件。

```
$ touch app01/serializers.py
```

书写自定义序列器 Serializer 派生类，我们以 user 举例：

```
from rest_framework import serializers


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    name = serializers.CharField(max_length=32, required=True)
    balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, coerce_to_string=True, required=False)
    level = serializers.IntegerField(required=False)

    # 多表关系可以用 SerializerMethodField 字段
    bought = serializers.SerializerMethodField()
    author_account = serializers.SerializerMethodField()

    # 定义钩子函数，以 get_ 开头，field 名称结尾
    def get_bought(self, obj):
        return obj.bought.all()

    def get_author_account(self, obj):
        return obj.author_account_id
```

### 使用自定义序列器

在 views.py 文件书写 UserAPI 的 GET 逻辑：

```
from rest_framework.views import APIView

from . import models
from . import serializers
from Common.api_response import APIResponse


class UserAPI(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        # 获取一个用户
        if pk:
            user_object = models.User.objects.filter(
                pk=pk, is_delete=False).first()

            # 有这个用户
            if user_object:
                return APIResponse(
                    status=1,
                    # data 是序列化完成后的数据，由于 user_object 是一个具体的对象
                    # 所以这里序列化后的结果是一个字典
                    data=serializers.UserSerializer(user_object).data,
                    message=f"get user {pk} success"
                )

            # 没有这个用户
            return APIResponse(
                status=0,
                data=None,
                message=f"get user {pk} fail, user not found"
            )

        # 获取所有用户
        user_queryset = models.User.objects.filter(is_delete=False)

        # 非空的 QuerySet
        if user_queryset:
            return APIResponse(
                status=1,
                # data 是序列化完成后的数据，由于 user_queryset 是一个 QuerySet
                # 所以这里序列化后的结果是一个列表套字典
                # 并且需要注意的是，在序列化一个 QuerySet 的时候，必须要指定 many=True
                data=serializers.UserSerializer(user_queryset, many=True).data,
                message="get all user success"
            )

        # 空的 QuerySet
        return APIResponse(
            status=0,
            data=[],
            message="get all user fail, query is empty"
        )
```

### 测试自定义序列化

手动定义 url 路由关系映射：

```
from django.contrib import admin
from django.urls import path

from app01 import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/', views.UserAPI.as_view()),
    path('api/user/<int:pk>/', views.UserAPI.as_view()),
]
```

使用 APIPost 测试，获取单个用户得到的是一个字典，获取多个用户得到的是一个列表套字典：

```
GET http://127.0.0.1:8000/api/user/1/

{
	"status": 1,
	"data": {
		"id": 1,
		"name": "张三",
		"balance": "1000.00",
		"level": 0,
		"bought": [],
		"author_account": 1
	},
	"message": "get user 1 success"
}


GET http://127.0.0.1:8000/api/user/
{
	"status": 1,
	"data": [
		{
			"id": 1,
			"name": "张三",
			"balance": "1000.00",
			"level": 0,
			"bought": [],
			"author_account": 1
		},
		{
			"id": 2,
			"name": "李四",
			"balance": "900.00",
			"level": 0,
			"bought": [],
			"author_account": 2
		},
		{
			"id": 3,
			"name": "王五",
			"balance": "400.00",
			"level": 0,
			"bought": [],
			"author_account": 3
		},
		{
			"id": 4,
			"name": "赵六",
			"balance": "200.00",
			"level": 0,
			"bought": [],
			"author_account": 4
		},
		{
			"id": 5,
			"name": "田七",
			"balance": "0.00",
			"level": 0,
			"bought": [],
			"author_account": null
		},
		{
			"id": 6,
			"name": "陈八",
			"balance": "0.00",
			"level": 0,
			"bought": [],
			"author_account": null
		},
		{
			"id": 7,
			"name": "黄九",
			"balance": "0.00",
			"level": 0,
			"bought": [],
			"author_account": null
		},
		{
			"id": 8,
			"name": "周十",
			"balance": "0.00",
			"level": 0,
			"bought": [],
			"author_account": null
		}
	],
	"message": "get all user success"
}
```

### 使用 source 参数

在自定义序列器中，如果序列器的字段名称和模型类中某个字段名称相同，则会自动将序列器字段与模型类字段做对应。

如果自定义序列器的字段名称在模型类中没有对应的字段，那么可以使用 source 参数指定序列器字段应该如何序列化模型类中的数据。

最常见的一个场景就是映射多表关系，我们可以在模型类中定义一个代理属性，然后序列器中利用 source 参数指定该代理属性并将返回结果序列化。

比如，我们要在 user 表中展示其关联帐号作者的名称，可以先在 user 模型类中定义一个代理属性：

```
@property
def author(self):
    return self.author_account.name
```

然后再到 user 的序列器中定义一个字段，并指定 source 为刚刚定义好的代理属性：

```
# source 作者名称
author_name = serializers.CharField(source="author", read_only=True)
```

最终结果：

```
GET http://127.0.0.1:8000/api/user/1/

{
	"status": 1,
	"data": {
		"id": 1,
		"name": "张三",
		"balance": "1000.00",
		"level": 0,
		"bought": [],
		"author_account": 1,
		"author_name": "铁笔判官"
	},
	"message": "get user 1 success"
}
```

### SerializerMethodField 字段介绍

SerializerMethodField 是一个非常特别的字段，它的使用非常简单，只需要定义一个 SerializerMethodField 字段，并且通过 get_filedname 指定其钩子函数即可。

这里不再举例，因为上面已经演示过了。

### 使用另一个序列器作为字段

多表关系还可以用另一个序列器来指定，所有的 Serializer 本质上都是一个字段。

如下所示，我们需要在 author_info 字段中返回作者的所有信息：

```
class AuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False)

    income = serializers.DecimalField(
        max_digits=10, decimal_places=2, coerce_to_string=True, required=False)


class UserSerializer(serializers.Serializer):
    ...

    # 作者信息
    author_info = AuthorSerializer(required=False)
```

由于我们查询的 user_object 本身并没有 author_info 属性，所以还需要为 user_object 添加 author_info 属性：

```
# 获取一个用户
if pk:
    user_object = models.User.objects.filter(
        pk=pk, is_delete=False).first()

    author_object = models.Author.objects.filter(
        user=user_object, is_delete=False).first()


    user_object.author_info = author_object
    ...

# 获取所有用户
user_queryset = models.User.objects.filter(is_delete=False)
for user_object in user_queryset:
    author_object = models.Author.objects.filter(
        user=user_object, is_delete=False).first()

    user_object.author_info = author_object
    ...
```

最终结果：

```
GET http://127.0.0.1:8000/api/user/1/

{
	"status": 1,
	"data": {
		"id": 1,
		"name": "张三",
		"balance": "1000.00",
		"level": 0,
		"bought": [],
		"author_account": 1,
		"author_info": {
			"id": 1,
			"name": "铁笔判官",
			"description": "作者很懒，还没有介绍自己...",
			"income": "2000.00"
		}
	},
	"message": "get user 1 success"
}
```

## 反序列化

### 反序列化钩子函数

在反序列化过程中，所有的字段都可以指定 1 个钩子函数：

- validate\_字段名称：局部钩子（优先执行）

除此之外，所有的字段都会运行 1 个全局钩子函数：

- validate：全局钩子（最后执行）

伪代码示例：

```
def validate_字段名称(self, data):
    """
    data: 该字段反序列化时所传递的数据
    钩子函数对数据处理完成后必须返回 data
    """
    ...
    return data

def validate(self, validated_data):
    """
    validated_data: 包含所有字段信息的字典
    {
        "field1": "...",
        "field2": "..."
    }
    """

    return validated_data
```

### 覆写 create 和 update

序列器类中提供了 create 和 update 方法。

- create 方法针对 POST 请求，即新增资源对象
- update 方法针对 PUT、PATCH 请求，即更新资源对象

我们自定义的序列器如果父类是 Serializer，那么需要我们自己覆写这 2 个方法，否则会抛出异常。

函数签名：

```
    def update(self, instance, validated_data):
        raise NotImplementedError('`update()` must be implemented.')

    def create(self, validated_data):
        raise NotImplementedError('`create()` must be implemented.')
```

参数释义：

```
update:
    - instance：需要更新的对象
    - validated_data：反序列化中所有字段的数据

create:
    - validated_data：反序列化中所有字段的数据
```

最后我们需要注意，当一个对象被创建或者被更新后，应当对其结果进行 return。

这样才能从 Serializer 实例对象的 data 属性中获取到它。

### 主动抛出异常

若想在反序列化的各种方法中抛出异常，则必须导入 rest_framework 所提供的 exceptions 对象。

使用方法：

```
from rest_framework import exceptions
```

异常抛出后的错误信息，会保存在序列器类实例的 errors 属性中。


### 增加反序列化逻辑

现在我们继续为 user 模型添加反序列化代码。

反序列化主要针对 POST、PATCH、PUT 方法，我们这里只实现 POST 和 PATCH 方法。

- POST：对于 POST 新增用户而言，应当对用户注册时的密码进行二次验证，如果验证不成功则抛出异常
- PATCH：对于修改用户信息而言，不需要用户输入任何密码

综上所述，我们需要 2 个序列器，一个序列化器专门针对 POST 方法，另一个序列器专门针对 GET、PATCH 方法。

为什么呢？因为 POST 需要二次验证密码，而 GET、PATCH 都不需要进行密码的二次验证。

```
import hashlib

from rest_framework import serializers
from rest_framework import exceptions

from . import models


class UserSerializer(serializers.Serializer):
    """
    这个序列器只用于获取、更新用户信息，不用于创建用户
    """
    id = serializers.IntegerField(required=True)
    name = serializers.CharField(max_length=32, required=True)
    balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, coerce_to_string=True, required=False)
    level = serializers.IntegerField(required=False)

    # 多表关系可以用 SerializerMethodField 字段
    bought = serializers.SerializerMethodField()
    author_account = serializers.SerializerMethodField()

    # 定义钩子函数，以 get_ 开头，field 名称结尾
    def get_bought(self, obj):
        return obj.bought.all()

    def get_author_account(self, obj):
        return obj.author_account_id

    def update(self, instance, validated_data):
        for k, v in validated_data.items():
            setattr(instance, k, v)
        # 保存被更新的对象
        instance.save()
        # 返回被更新的对象，view 中可以直接使用 data 属性调用到
        return instance


class UserPostSerializer(UserSerializer):
    """
    这个序列器只用于创建用户，不用于获取、更新用户信息
    """
    password = serializers.CharField(
        max_length=64,
        min_length=6,
        required=True,
        write_only=True,
        error_messages={
            "max_length": "Password length cannot exceed 64 bits",
            "min_length": "Password length cannot be less than 6 digits",
        }
    )

    re_password = serializers.CharField(
        max_length=64,
        min_length=6,
        required=True,
        write_only=True,
        error_messages={
            "max_length": "Password length cannot exceed 64 bits",
            "min_length": "Password length cannot be less than 6 digits",
        }
    )

    # 其实这 2 个钩子函数都可以直接写道 validate 中
    def validate_password(self, data):
        return hashlib.md5(data.encode("utf-8")).hexdigest()

    def validate_re_password(self, data):
        return hashlib.md5(data.encode("utf-8")).hexdigest()

    def validate(self, validated_data):
        # 验证密码是否一致，并弹出 re_password
        if validated_data["password"] != validated_data.pop("re_password"):
            # 如果密码不一致，抛出异常，view 中可以直接使用 errors 属性调用到
            raise exceptions.ValidationError("Password does not match")
        return validated_data

    def create(self, validated_data):
        # 创建用户
        # 将创建完成后的对象返回，view 中可以直接使用 data 属性调用到
        return models.User.objects.create(**validated_data)

```


### 反序列化视图书写

视图代码如下：

```
from rest_framework.views import APIView

from . import models
from . import serializers
from Common.api_response import APIResponse


class UserAPI(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        # 获取一个用户
        if pk:
            user_object = models.User.objects.filter(
                pk=pk, is_delete=False).first()

            # 有这个用户
            if user_object:
                return APIResponse(
                    status=1,
                    # data 是序列化完成后的数据，由于 user_object 是一个具体的对象
                    # 所以这里序列化后的结果是一个字典
                    data=serializers.UserSerializer(user_object).data,
                    message=f"get user {pk} success"
                )

            # 没有这个用户
            return APIResponse(
                status=0,
                data=None,
                message=f"get user {pk} fail, user not found"
            )

        # 获取所有用户
        user_queryset = models.User.objects.filter(is_delete=False)

        # 非空的 QuerySet
        if user_queryset:
            return APIResponse(
                status=1,
                # data 是序列化完成后的数据，由于 user_queryset 是一个 QuerySet
                # 所以这里序列化后的结果是一个列表套字典
                # 并且需要注意的是，在序列化一个 QuerySet 的时候，必须要指定 many=True
                data=serializers.UserSerializer(user_queryset, many=True).data,
                message="get all user success"
            )

        # 空的 QuerySet
        return APIResponse(
            status=0,
            data=[],
            message="get all user fail, query is empty"
        )

    def post(self, request, *args, **kwargs):
        # 反序列化，直接传入 request.data
        # 即 required=True 的字段也可以不传
        serializer_result = serializers.UserPostSerializer(
            data=request.data)

        # 反序列化成功
        if serializer_result.is_valid():

            # 保存此次反序列化的结果
            serializer_result.save()

            return APIResponse(
                status=1,
                data=serializer_result.data,
                message="create user success"
            )

        # 反序列化失败
        return APIResponse(
            status=0,
            data=serializer_result.errors,
            message="create user fail"
        )

    def patch(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        # 如果没有 pk 参数，则返回错误
        if pk:
            user_object = models.User.objects.filter(
                pk=pk, is_delete=False).first()
            # 有这个用户
            if user_object:

                # 传入：
                # instance: 实例对象
                # data: 前端传入的数据
                # partial: 是否只更新部分字段
                serializer_result = serializers.UserSerializer(
                    instance=user_object, data=request.data, partial=True
                )
                # 反序列化成功
                if serializer_result.is_valid():
                    serializer_result.save()

                    return APIResponse(
                        status=1,
                        data=serializer_result.data,
                        message=f"update user {pk} success"
                    )

                return APIResponse(
                    status=0,
                    data=serializer_result.errors,
                    message=f"update user {pk} fail"
                )

            # 没有这个用户
            return APIResponse(
                status=0,
                data=None,
                message=f"patch user {pk} fail, user not found"
            )

        return APIResponse(
            status=0,
            data=None,
            message="update user fail, pk is required"
        )
```

### 测试反序列化结果

创建新用户使用 POST 请求发送 JSON 数据：

```
POST http://127.0.0.1:8000/api/user/
{
    "name": "小石头",
    "password":"abcdefg",
    "re_password": "abcdefg"
}
```

返回结果：

```
{
	"status": 1,
	"data": {
		"id": 9,
		"name": "小石头",
		"balance": "0.00",
		"level": 0,
		"bought": [],
		"author_account": null
	},
	"message": "create user success"
}
```

更新用户使用 PATCH 请求发送 JSON 数据：

```
PATCH http://127.0.0.1:8000/api/user/9/

{
    "name": "大石头",
}
```

返回结果：

```
{
	"status": 1,
	"data": {
		"id": 9,
		"name": "大石头",
		"balance": "0.00",
		"level": 0,
		"bought": [],
		"author_account": null
	},
	"message": "update user 9 success"
}
```


### 额外的上下文

视图中如何向序列化器传入额外的数据？

可以通过 context 关键字传入，序列化器中使用 self.\_context 取出：

```
视图中：

serializer_result = serializers.UserSerializer(
    instance=user_object, data=request.data, partial=True,
    context={'request': request}
)


序列化器：

def update(self, instance, validated_data):
    print(self._context)
    {'request': <rest_framework.request.Request: PATCH '/api/user/9/'>}
    ...
```
