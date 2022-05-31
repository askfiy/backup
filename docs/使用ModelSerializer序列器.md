# 使用 ModelSerializer 序列器

## 与 Serializer 的异同

ModelSerializer 是日常开发中使用较多的一种序列器。

相较于 Serializer 来说：

- 不用自己定义字段，模型类中的字段都能够自己定义
- 对于简单的常见不用覆写 create 和 update 方法，其内部均以实现

同时 Serializer 能实现的 ModelSerializer 都能实现，因为 ModelSerializer 是 Serializer 的派生类。

## 序列化

### 创建 ModelSerializer 序列器

继续在 serializers.py 文件中书写模型序列器 ModelSerializer 派生类，我们以 book 举例：

```
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Book
        fields = [
            "id",
            "name",
            "price",
            "author",
            "publisher",
            "level",
        ]
        extra_kwargs = {
            "id": {"read_only": True},
            "name": {"max_length": 32},
            "price": {"max_digits": 10, "decimal_places": 2},
            "author": {"required": True},
            "publisher": {"required": True},
            "level": {"required": False},
        }
```

Meta 类是 ModelSerializer 和 Serializer 区别最大的地方。

Meta 类中可以定义该序列器所绑定的模型类，以及可以规定模型类字段的序列化规则。

注意！ ModelSerializer 中也可以自定义字段，总体来说和模型类直接关联的都书写在 Meta 类中，自定义的都写在 Meta 类上，比如：

```
class BookSerializer(serializers.ModelSerializer):
    # 自定义的写在上面
    自定义字段 = 字段类型(约束条件, 约束条件)

    class Meta:
        # 与模型类相关的写在下面
        ...
```


### 常见的 Meta 类属性

如果序列器使用的是 ModelSerializer，那么其常见的及其可用的 Meta 属性如下：

```
model: 指定需要序列化的模型类

fields：需要序列化的模型字段

    - fields = '__all__'
    - fields = ("field1", "field2", "...")

exclude：排除需要序列化的模型字段（跟 fields 属性互斥，一个 Meta 不能同时拥有这 2 个属性）

    - exclude = ("field1", "field2", "...")

read_only_fields：用于指定只读字段，可以代替多个指定了 read_only 参数的字段

    - read_only_fields = ("field1", "field2", "...")

extra_kwargs：用于指定多个字段的参数，可以代替多个指定了不同参数的字段（注意！不能指定自定义字段的参数）

    - extra_kwargs = {
        "field1" : {"read_only": true},
        "field2" : {"write_only": true, "required": true},
        "..."
    }


depth：为序列化指定层级深度，默认为 0,即扁平的
```



### 使用 ModelSerializer 序列器

模型序列器的使用和 Serializer 序列器一致，views 中代码逻辑如下：

```
from rest_framework.views import APIView

from . import models
from . import serializers
from Common.api_response import APIResponse


class BookAPI(APIView):

    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        # 获取一个书籍
        if pk:
            book_object = models.Book.objects.filter(
                pk=pk, is_delete=False).first()

            # 有这个书籍
            if book_object:
                return APIResponse(
                    status=1,
                    # data 是序列化完成后的数据，由于 book_object 是一个具体的对象
                    # 所以这里序列化后的结果是一个字典
                    data=serializers.BookSerializer(book_object).data,
                    message=f"get book {pk} success"
                )

            # 没有这个书籍
            return APIResponse(
                status=0,
                data=None,
                message=f"get book {pk} fail, book not found"
            )

        # 获取所有书籍
        book_queryset = models.Book.objects.filter(is_delete=False)

        # 非空的 QuerySet
        if book_queryset:
            return APIResponse(
                status=1,
                # data 是序列化完成后的数据，由于 book_queryset 是一个 QuerySet
                # 所以这里序列化后的结果是一个列表套字典
                # 并且需要注意的是，在序列化一个 QuerySet 的时候，必须要指定 many=True
                data=serializers.BookSerializer(book_queryset, many=True).data,
                message="get all book success"
            )

        # 空的 QuerySet
        return APIResponse(
            status=0,
            data=[],
            message="get all book fail, query is empty"
        )
```

### 测试 ModelSerializer 序列器

手动定义 url 路由关系映射：


```
from django.contrib import admin
from django.urls import path

from app01 import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/book/', views.BookAPI.as_view()),
    path('api/book/<int:pk>/', views.BookAPI.as_view()),
]
```

使用 APIPost 测试，获取一本书籍得到的是一个字典，获取多本书籍得到的是一个列表套字典：

```
GET http://127.0.0.1:8000/api/book/1/

{
	"status": 1,
	"data": {
		"id": 1,
		"name": "昨夜西风凋碧树",
		"price": "100.00",
		"author": 1,
		"publisher": 1,
		"level": 0
	},
	"message": "get book 1 success"
}


GET http://127.0.0.1:8000/api/book/

{
	"status": 1,
	"data": [
		{
			"id": 1,
			"name": "昨夜西风凋碧树",
			"price": "100.00",
			"author": 1,
			"publisher": 1,
			"level": 0
		},
		{
			"id": 2,
			"name": "明月何曾照我还",
			"price": "82.00",
			"author": 2,
			"publisher": 1,
			"level": 0
		},
		{
			"id": 3,
			"name": "又是一年春天",
			"price": "78.00",
			"author": 3,
			"publisher": 2,
			"level": 1
		},
		{
			"id": 4,
			"name": "难得年华",
			"price": "66.00",
			"author": 1,
			"publisher": 3,
			"level": 1
		},
		{
			"id": 5,
			"name": "再见二十四岁",
			"price": "88.00",
			"author": 2,
			"publisher": 2,
			"level": 2
		},
		{
			"id": 6,
			"name": "昨天的我",
			"price": "92.00",
			"author": 2,
			"publisher": 3,
			"level": 2
		}
	],
	"message": "get all book success"
}
```

### 多表层级序列化

Meta 类中的 depth 属性可以指定多表关系反序列化的层级。

默认是 0：

```
depth = 0


{
	"status": 1,
	"data": {
		"id": 1,
		"name": "昨夜西风凋碧树",
		"price": "100.00",
		"author": 1,
		"publisher": 1,
		"level": 0
	},
	"message": "get book 1 success"
}
```

修改为 3，就可以关联出 3 张表的数据：

```
{
	"status": 1,
	"data": {
		"id": 1,
		"name": "昨夜西风凋碧树",
		"price": "100.00",
		"author": {
			"id": 1,
			"create_time": "2022-04-01T13:31:50.914096Z",
			"update_time": "2022-04-01T13:31:50.914140Z",
			"is_delete": false,
			"name": "铁笔判官",
			"description": "作者很懒，还没有介绍自己...",
			"income": "2000.00"
		},
		"publisher": {
			"id": 1,
			"create_time": "2022-04-01T13:31:50.916304Z",
			"update_time": "2022-04-01T13:31:50.916352Z",
			"is_delete": false,
			"name": "北京大学出版社",
			"address": "北京市海淀区"
		},
		"level": 0
	},
	"message": "get book 1 success"
}
```

depth 属性常在生成宽表做数据分析的场景中使用。

## 反序列化

### 增加反序列化逻辑

反序列化也和 Serializer 基本一致，但我们增加书籍不用二次密码验证，所以一个序列器就足够了。

另外，由于 ModelSerializer 的 create 和 update 方法都已内部实现，所以没有特殊需求也不需要覆写这 2 个方法。

上面定义的 ModelSerializer 序列器直接也可以用于反序列化。

### 反序列化视图书写

视图代码如下：

```
class BookAPI(APIView):

    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        # 获取一个书籍
        if pk:
            book_object = models.Book.objects.filter(
                pk=pk, is_delete=False).first()

            # 有这个书籍
            if book_object:
                return APIResponse(
                    status=1,
                    # data 是序列化完成后的数据，由于 book_object 是一个具体的对象
                    # 所以这里序列化后的结果是一个字典
                    data=serializers.BookSerializer(book_object).data,
                    message=f"get book {pk} success"
                )

            # 没有这个书籍
            return APIResponse(
                status=0,
                data=None,
                message=f"get book {pk} fail, book not found"
            )

        # 获取所有书籍
        book_queryset = models.Book.objects.filter(is_delete=False)

        # 非空的 QuerySet
        if book_queryset:
            return APIResponse(
                status=1,
                # data 是序列化完成后的数据，由于 book_queryset 是一个 QuerySet
                # 所以这里序列化后的结果是一个列表套字典
                # 并且需要注意的是，在序列化一个 QuerySet 的时候，必须要指定 many=True
                data=serializers.BookSerializer(book_queryset, many=True).data,
                message="get all book success"
            )

        # 空的 QuerySet
        return APIResponse(
            status=0,
            data=[],
            message="get all book fail, query is empty"
        )

    def post(self, request, *args, **kwargs):
        # 反序列化，直接传入 request.data
        # 即 required=True 的字段也可以不传
        serializer_result = serializers.BookSerializer(
            data=request.data)

        # 反序列化成功
        if serializer_result.is_valid():

            # 保存此次反序列化的结果
            serializer_result.save()

            return APIResponse(
                status=1,
                data=serializer_result.data,
                message="create book success"
            )

        # 反序列化失败
        return APIResponse(
            status=0,
            data=serializer_result.errors,
            message="create book fail"
        )

    def patch(self, request, *args, **kwargs):
        pk = kwargs.get('pk')

        # 如果没有 pk 参数，则返回错误
        if pk:
            book_object = models.Book.objects.filter(
                pk=pk, is_delete=False).first()
            # 有这个书籍
            if book_object:

                # 传入：
                # instance: 实例对象
                # data: 前端传入的数据
                # partial: 是否只更新部分字段
                serializer_result = serializers.BookSerializer(
                    instance=book_object, data=request.data, partial=True,
                    context={'request': request}
                )
                # 反序列化成功
                if serializer_result.is_valid():
                    serializer_result.save()

                    return APIResponse(
                        status=1,
                        data=serializer_result.data,
                        message=f"update book {pk} success"
                    )

                return APIResponse(
                    status=0,
                    data=serializer_result.errors,
                    message=f"update book {pk} fail"
                )

            # 没有这个书籍
            return APIResponse(
                status=0,
                data=None,
                message=f"patch book {pk} fail, book not found"
            )

        return APIResponse(
            status=0,
            data=None,
            message="update book fail, pk is required"
        )
```

### 测试反序列化结果


创建新书籍使用 POST 请求发送 JSON 数据：

```
POST http://127.0.0.1:8000/api/book/
{
    "name": "花有重开日",
    "price": 128,
    "author": 2,
    "publisher": 3
}
```

返回结果：

```
{
	"status": 1,
	"data": {
		"id": 7,
		"name": "花有重开日",
		"price": "128.00",
		"author": 2,
		"publisher": 3,
		"level": 0
	},
	"message": "create book success"
}
```


更新书籍使用 PATCH 请求发送 JSON 数据：

```
http://127.0.0.1:8000/api/book/7/

{
    "price": 130,
}
```

返回结果：

```
{
	"status": 1,
	"data": {
		"id": 7,
		"name": "花有重开日",
		"price": "130.00",
		"author": 2,
		"publisher": 3,
		"level": 0
	},
	"message": "update book 7 success"
}
```

### 自定义字段

如果有二次密码验证，那么必须将自定义字段书写在 fields 中：

```
class UserSerializer(serializers.ModelSerializer):
    re_password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = models.User
        fields = ("username", "password", "re_password", "email")

        extra_kwargs = {
            "password": {"write_only": True},
        }
```

