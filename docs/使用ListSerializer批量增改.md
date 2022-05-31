# 使用 ListSerializer 批量更新序列器

## ListSerializer 介绍

无论是 Serializer 或者 ModelSerializer 实际上都不支持批量更新（但支持批量创建）。

ListSerializer 能够让 Serializer 或 ModelSerializer 支持批量更新。

## 序列化

### 创建 ModelSerializer 序列器

我们以 ModelSerializer 举例来序列化 Publisher 表，在 serializers.py 文件中创建模型序列器 ModelSerializer 派生类：

```
class PublisherSerializer(serializers.ModelSerializer):

    class Meta:

        model = models.Publisher
        fields = [
            "id",
            "name",
            "address",
        ]
        extra_fields = {
            "id": {"read_only": True},
            "name": {"max_length": 32},
            "address": {"max_length": 32},
        }
```

### 使用 ModelSerializer 序列器

书写 Publisher 的 GET 请求逻辑：

```
class PublisherAPI(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        # 获取一个出版社
        if pk:
            publisher_object = models.Publisher.objects.filter(
                pk=pk, is_delete=False).first()

            # 有这个出版社
            if publisher_object:
                # 注意！因为我们现在做的是批量操作，所以这里对获取一个出版社而言
                # 应该返回一个列表，而不是一个字典
                return APIResponse(
                    status=1,
                    data=[serializers.PublisherSerializer(
                        publisher_object).data],
                    message=f"get publisher {pk} success"
                )

            # 没有这个出版社
            return APIResponse(
                status=0,
                # 这里也要返回一个列表，而不是一个字典
                data=[],
                message=f"get publisher {pk} fail, publisher not found"
            )

        # 获取所有出版社
        publisher_queryset = models.Publisher.objects.filter(is_delete=False)
        if publisher_queryset:
            return APIResponse(
                status=1,
                data=serializers.PublisherSerializer(
                    publisher_queryset, many=True).data,
                message="get all publisher success"
            )

        # 空的 QuerySet
        return APIResponse(
            status=0,
            data=[],
            message="get all publisher fail, query is empty"
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
    path('api/user/', views.UserAPI.as_view()),
    path('api/user/<int:pk>/', views.UserAPI.as_view()),
    path('api/book/', views.BookAPI.as_view()),
    path('api/book/<int:pk>/', views.BookAPI.as_view()),
    path('api/publisher/', views.PublisherAPI.as_view()),
    path('api/publisher/<int:pk>/', views.PublisherAPI.as_view()),
]
```

使用 APIPost 测试，无论是获取一个出版社还是多个出版社，得到的结果始终是一个列表套字典：

```
{
	"status": 1,
	"data": [
		{
			"id": 1,
			"name": "北京大学出版社",
			"address": "北京市海淀区"
		}
	],
	"message": "get publisher 1 success"
}
```

## 反序列化

### 定义数据格式

在使用批量创建或更新时，需要我们自己定义数据格式。

我们准备在支持单个创建、更新的基础上再增加上支持批量创建、更新的功能。

- 单个创建：request.data 是一个字典时，是单个创建
- 批量创建：request.data 是一个列表时，是批量创建
- 单个更新：当请求 url 中存在 pk 参数时，是单个更新
- 批量更新：当请求 url 中不存在 pk 参数，但 request.data 是一个列表时，是批量更新

格式如下：

```
单个创建：
    - method: POST
    - url : http://127.0.0.1:8000/api/publisher/
    - data: {"field": "..."}

批量创建：
    - method: POST
    - url : http://127.0.0.1:8000/api/publisher/
    - data: [{"field": "..."}, {"field": "..."}, ...]

单个更新：
    - method: PATCH
    - url : http://127.0.0.1:8000/api/publisher/1/
    - data: {"field": "..."}

批量更新：
    - method: PATCH
    - url : http://127.0.0.1:8000/api/publisher/
    - data: [{"id": "1", "field": "..."}, {"id": "2", "field": "..."}, ...]
```

### 使用 ListSerializer 序列器

在反序列化过程中如果对序列器实例化传入 many=True 的参数时，其实内部都会生成一个全新的 ListSerializer 实例来进行批量反序列化。

这个内部生成的 ListSerializer 实例是不支持批量更新的。

所以我们需要自己实现一个 ListSerializer 并覆写 update 方法，还需指定 PublisherSerilizer 使用我们自己实现的 ListSerializer：

```
class PublisherBulkCreateAndUpdateSerializer(serializers.ListSerializer):

    def create(self, validated_data):
        # 创建多个对象
        # 这里可以自己定义一些逻辑
        # 重要：如果你自己的序列器 PublisherSerilizer 不是继承的 ModelSerializer 而是 Serializer
        # 那么必须自己在 PublisherSerializer 中实现 create 方法
        # 因为它内部会调用 PublisherSerilizer 的 create 方法
        return super(__class__, self).create(validated_data)

    def update(self, instance, validated_data):
        # 必须覆写 update 方法更新
        # self.child 就是 Publisher 类
        # 注意： instance 也是一个列表 [需要更新的对象1, 需要更新的对象2]
        # validated_data: 也是一个列表 [更新的数据1, 更新的数据2]
        # 所以下面我们采用 enumerate 来循环更新的数据项
        # 重要：如果你自己的序列器 PublisherSerilizer 不是继承的 ModelSerializer 而是 Serializer
        # 那么必须自己在 PublisherSerializer 中实现 update 方法
        # 因为这里会调用
        return [
            self.child.update(
                instance[i], attrs
            )
            for i, attrs in enumerate(validated_data)
        ]

    def to_internal_value(self, data):
        """
        List of dicts of native values <- List of dicts of primitive datatypes.
        """
        # 在新版的 drf 中，我们必须在 ListSerializer 中覆写该验证方法才能使批量更新生效

        # 如果传入了 instance 参数，则代表是更新操作，不需要做任何验证
        if self.instance:
            return data
        return super(__class__, self).to_internal_value(data)


class PublisherSerializer(serializers.ModelSerializer):

    class Meta:
        # 指定使用我们自己定义的 ListSerializer
        list_serializer_class = PublisherBulkCreateAndUpdateSerializer

        model = models.Publisher
        fields = [
            "id",
            "name",
            "address",
        ]
        extra_fields = {
            "id": {"read_only": True},
            "name": {"max_length": 32},
            "address": {"max_length": 32},
        }
```

### 反序列化视图书写

批量创建、更新的反序列化视图逻辑如下：

```
class PublisherAPI(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        # 获取一个出版社
        if pk:
            publisher_object = models.Publisher.objects.filter(
                pk=pk, is_delete=False).first()

            # 有这个出版社
            if publisher_object:
                # 注意！因为我们现在做的是批量操作，所以这里对获取一个出版社而言
                # 应该返回一个列表，而不是一个字典
                return APIResponse(
                    status=1,
                    data=[serializers.PublisherSerializer(
                        publisher_object).data],
                    message=f"get publisher {pk} success"
                )

            # 没有这个出版社
            return APIResponse(
                status=0,
                # 这里也要返回一个列表，而不是一个字典
                data=[],
                message=f"get publisher {pk} fail, publisher not found"
            )

        # 获取所有出版社
        publisher_queryset = models.Publisher.objects.filter(is_delete=False)
        if publisher_queryset:
            return APIResponse(
                status=1,
                data=serializers.PublisherSerializer(
                    publisher_queryset, many=True).data,
                message="get all publisher success"
            )

        # 空的 QuerySet
        return APIResponse(
            status=0,
            data=[],
            message="get all publisher fail, query is empty"
        )

    def post(self, request, *args, **kwargs):
        # 同时支持新增一条和多条
        # 新增一条
        if isinstance(request.data, dict):

            serializer_result = serializers.PublisherSerializer(
                data=request.data)

            # 反序列化成功
            if serializer_result.is_valid():

                # 保存此次反序列化的结果
                serializer_result.save()

                return APIResponse(
                    status=1,
                    data=serializer_result.data,
                    message="create publisher success"
                )

            # 反序列化失败
            return APIResponse(
                status=0,
                data=serializer_result.errors,
                message="create publisher fail"
            )

        # 新增多条
        if isinstance(request.data, list):

            # 注意！反序列化时传入 many=True 才会调用 ListSherializer 序列器
            serializer_result = serializers.PublisherSerializer(
                data=request.data,
                many=True
            )

            # 反序列化成功
            if serializer_result.is_valid():

                # 保存此次反序列化的结果
                serializer_result.save()

                return APIResponse(
                    status=1,
                    data=serializer_result.data,
                    message="create publisher success"
                )

            # 反序列化失败
            return APIResponse(
                status=0,
                data=serializer_result.errors,
                message="create publisher fail"
            )

        return APIResponse(
            status=0,
            data=None,
            message="required request data"
        )

    def patch(self, request, *args, **kwargs):
        # 同时支持更新一条和多条
        # 更新一条

        pk = kwargs.get('pk')

        # 有 pk 参数，更新一条
        if pk:
            publisher_object = models.Publisher.objects.filter(
                pk=pk, is_delete=False).first()
            # 有这个出版社
            if publisher_object:

                # 传入：
                # instance: 实例对象
                # data: 前端传入的数据
                # partial: 是否只更新部分字段
                serializer_result = serializers.PublisherSerializer(
                    instance=publisher_object, data=request.data, partial=True,
                    context={'request': request}
                )
                # 反序列化成功
                if serializer_result.is_valid():
                    serializer_result.save()

                    return APIResponse(
                        status=1,
                        data=serializer_result.data,
                        message=f"update publisher {pk} success"
                    )

                return APIResponse(
                    status=0,
                    data=serializer_result.errors,
                    message=f"update publisher {pk} fail"
                )

            # 没有这个出版社
            return APIResponse(
                status=0,
                data=None,
                message=f"patch publisher {pk} fail, publisher not found"
            )

        # 没有 pk 参数但有请求体，这意味着是更新多个
        if isinstance(request.data, list):
            # 构建需要更新的对象，并且把 request.body 中每一个字段中的 id 踢出来
            # [
            #   {"id": 1, "field", "..."},
            #   {"id": 2, "field", "..."},
            #   {"id": 2, "field", "..."},
            # ]
            required_update_objects = [
                models.Publisher.objects.filter(
                    pk=value.pop("id"),
                    is_delete=False,
                ).first()
                for value in request.data
            ]

            # 传入：待更新的对象
            # 需要更新的数据
            # many = True 是必须的，这样才会调用我们自己实现的 ListSherializer
            serializer_result = serializers.PublisherSerializer(
                instance=required_update_objects,
                data=request.data,
                many=True,
                partial=True
            )

            if serializer_result.is_valid():
                # 保存数据
                serializer_result.save()
                # 更新成功
                return APIResponse(
                    status=1,
                    # 这里返回的数据就是 ListSherializer 中返回出来的列表
                    data=serializer_result.data,
                    message="update publisher success"
                )

            # 更新失败
            return APIResponse(
                status=0,
                data=serializer_result.errors,
                message="update publisher fail"
            )

        # 如果没有传入 pk 也没有传入请求体
        return APIResponse(
            status=0,
            data=None,
            message="update publisher fail, pk or request body is required"
        )
```

### 测试反序列化结果

使用 APIPost 测试反序列化。

新增 1 个：

```
POST http://127.0.0.1:8000/api/publisher/

{
    "name": "曹县星星出版社",
    "address":"山东菏泽曹县"
}
```

返回结果：

```
{
	"status": 1,
	"data": {
		"id": 4,
		"name": "曹县星星出版社",
		"address": "山东菏泽曹县"
	},
	"message": "create publisher success"
}
```

新增 N 个：

```
POST http://127.0.0.1:8000/api/publisher/

[
    {
        "name": "江海出版社",
        "address": "浙江杭州"
    },
    {
        "name": "神州出版社",
        "address": "江西赣州"
    }
]
```

返回结果：

```
{
	"status": 1,
	"data": [
		{
			"id": 5,
			"name": "江海出版社",
			"address": "浙江杭州"
		},
		{
			"id": 6,
			"name": "神州出版社",
			"address": "江西赣州"
		}
	],
	"message": "create publisher success"
}
```

更新 1 个：

```
PATCH http://127.0.0.1:8000/api/publisher/1/

{
    "name": "大海出版社"
}
```

返回结果：

```
{
	"status": 1,
	"data": {
		"id": 1,
		"name": "大海出版社",
		"address": "北京市海淀区"
	},
	"message": "update publisher 1 success"
}
```

更新 N 个：

```
PATCH http://127.0.0.1:8000/api/publisher/

[
    {
        "id": 2,
        "name": "大江出版社"
    },
    {
        "id": 3,
        "name": "大河出版社"
    }
]
```

返回结果：

```
{
	"status": 1,
	"data": [
		{
			"id": 2,
			"name": "大江出版社",
			"address": "上海市浦东新区"
		},
		{
			"id": 3,
			"name": "大河出版社",
			"address": "河南省郑州市"
		}
	],
	"message": "update publisher success"
}
```


