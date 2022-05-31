# viewset

## 基本介绍

rest_framework 中的 viewset 包含了许多功能，它能够让我们极为快速的编写出 API 接口。

它的内部逻辑较为复杂，但实现的效果非常酷。

正如 ViewSetMixIn 源码中的注释一样，这是一个魔法：

```
class ViewSetMixin:
    """
    This is the magic.
    ...
    """
```

## 准备工作

### 模型表

本次学习只会用到一张模型表：

```
from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=64, unique=True,
                             null=False, verbose_name='书名')

    author = models.CharField(max_length=64, null=False,
                              verbose_name='作者')

    price = models.DecimalField(max_digits=8, decimal_places=2,
                                null=False, verbose_name='价格')

    def __str__(self):
        return f"{self.pk} - {self.title}"
```

### 模型数据

模型数据如下：

```
from django.db.utils import DatabaseError
# Create your tests here.

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def insert_data():
    models.Book.objects.bulk_create(
        [
            models.Book(title='python', price=100, author="zhangsan"),
            models.Book(title='java', price=200, author="lisi"),
            models.Book(title='go', price=300, author="wangwu"),
            models.Book(title='c++', price=400, author="zhaoliu"),
        ]
    )


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")

    import django
    django.setup()

    from app01 import models

    try:
        with django.db.transaction.atomic():
            insert_data()
    except DatabaseError as e:
        print(e)
    else:
        print("数据插入成功")
```

### 序列类

使用 ModelSerializer 序列化器来对 Book 模型类做序列化以及反序列化工作：

```
from rest_framework import serializers

from . import models

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Book
        fields = "__all__"
```

### url 路由映射

手动定义 url 路由映射关系：

```
from django.urls import path

from app01 import views

urlpatterns = [
    path("api/book/", views.BookAPI.as_view()),
    path("api/book/<int:pk>/", views.BookAPI.as_view()),
]
```

## 使用 APIView

### APIView 的继承关系

APIView 的导入如下：

```
from rest_framework import APIView
```

APIView 继承了 Django 原生的 View 类，并在其之上做了一些封装。

```
                                                 ┌──────┐
                                                 │object│
                                                 └──────┘
                                                    ▲
                                     ┌──────────────┴───────────────┐
                                     │django.views.generic.base.View│
                                     └──────────────────────────────┘
                                                    ▲
                                     ┌──────────────┴───────────────┐
                                     │ rest_framework.views.APIView │
                                     └──────────────────────────────┘
```

### APIView 的封装特性

详细的 APIView 和 Django 原生 View 的区别我们已经在前面做过举例了。

总而言之有以下几点：

- 自动取消 csrf 认证
- 视图中的 request 参数接收的不再是 Django 原生的 request 对象
- 使用 request.data 接收 POST 请求体中传递的参数，支持 JSON 格式数据（代替 request.POST）
- 使用 request.query_params 接收 url 地址中的查询参数（代替 request.GET）

### 使用 APIView 书写接口

使用 APIView 对 Book 表进行增删改查的接口书写：

```
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from . import models
from . import serializers


class BookAPI(APIView):
    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        # 获取单个书籍
        if pk:
            # 若不存在，直接返回 404
            book_object = get_object_or_404(models.Book, pk=pk)
            # 存在该书籍
            if book_object:
                return Response(
                    serializers.BookSerializer(book_object).data,
                )

        # 获取所有的书籍
        book_queryset = models.Book.objects.all()
        return Response(
            serializers.BookSerializer(book_queryset, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        # 创建书籍
        serializer = serializers.BookSerializer(data=request.data)

        # 若验证失败，直接返回 400
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # 若验证成功，则返回 201，并返回创建的书籍
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        # 更新书籍
        book_object = get_object_or_404(models.Book, pk=kwargs.get('pk'))

        serializer = serializers.BookSerializer(
            instance=book_object,
            data=request.data,
            partial=True,
        )

        # 若验证失败，直接返回 400
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        # 删除书籍
        book_object = get_object_or_404(models.Book, pk=kwargs.get('pk'))

        book_object.delete()

        # 删除成功，返回 204
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### APIView 书写接口的问题发现

在上述视图代码书写中，有以下几点问题：

- 重复代码很多，每个接口都需要书写 ORM 语句
- 每个接口都需要针对同一个序列类作出不同的实例化

## 使用 GenericAPIView

### GenericAPIView 的继承关系

GenericAPIView 的导入如下：

```
from rest_framework.generics import GenericAPIView
```

GenericAPIView 是 APIView 的派生类，所以在 APIView 的基础上又做了一些其它的封装：

```
                                                 ┌──────┐
                                                 │object│
                                                 └──────┘
                                                    ▲
                                     ┌──────────────┴───────────────┐
                                     │django.views.generic.base.View│
                                     └──────────────────────────────┘
                                                    ▲
                                      ┌─────────────┴──────────────┐
                                      │rest_framework.views.APIView│
                                      └────────────────────────────┘
                                                    ▲
                                ┌───────────────────┴────────────────────┐
                                │ rest_framework.generics.GenericAPIView │
                                └────────────────────────────────────────┘
```

### GenericAPIView 的源码阅读

点开 GenericAPIView 的源码，你可以发现几个比较重要的类属性：

```
class GenericAPIView(views.APIView):
    """
    # 你需要设置这些属性，
    # 或覆盖`get_queryset()`/`get_serializer_class()`。
    # 如果你覆盖了一个视图方法，那么调用它很重要
    # `get_queryset()` 而不是直接访问 `queryset` 属性，
    # 因为 `queryset` 只会被评估一次，并且这些结果会被缓存
    # 对于所有后续请求。

    queryset = None
    serializer_class = None

    # 如果要使用 pk 以外的对象查找，请设置 'lookup_field'。
    # 对于更复杂的查找要求，覆盖 `get_object()`。

    lookup_field = 'pk'
    lookup_url_kwarg = None
    ...
```

GenericAPIView 定义的方法很少：

```
 GenericAPIView
├─ get_queryset
├─ get_object
├─ get_serializer
├─ get_serializer_class
├─ get_serializer_context
├─ filter_queryset
├─ paginator
├─ paginate_queryset
└─ get_paginated_response
```

1. get_queryset 方法：

```
def get_queryset(self):
    # 这里规定我们视图类中，应该定义一个 queryset 属性
    # 或者覆写 get_queryset 的方法
    assert self.queryset is not None, (
        "'%s' should either include a `queryset` attribute, "
        "or override the `get_queryset()` method."
        % self.__class__.__name__
    )

    queryset = self.queryset
    # 如果该 queryset 属性是一个 QuerySet 对象，则运行它的 all() 方法
    # 返回所有未经筛选的查询结果
    if isinstance(queryset, QuerySet):
        # Ensure queryset is re-evaluated on each request.
        queryset = queryset.all()
    return queryset
```

2. get_object 方法：

```
def get_object(self):
    # 运行 get_queryset 方法，获得一个未经过滤的 QuerySet.all 查询结果对象
    queryset = self.filter_queryset(self.get_queryset())

    # lookup_url_kwarg 默认是 None
    # 所以这里得到的结果是 pk
    lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

    # self 其实是我们自己定义的视图
    # 如果 self.kwargs 中没有 lookup_url_kwarg 定义的 key
    # 则抛出异常，假如：url: 捕获 <int:id> 查询对象，名称为 id
    # 则 self.kewargs: { id : 1}
    # 此时 lookup_url_kwarg 必须也要自己定义成 id，而不能再使用 pk 了
    # 否则便会触发下面的断言错误
    assert lookup_url_kwarg in self.kwargs, (
        'Expected view %s to be called with a URL keyword argument '
        'named "%s". Fix your URL conf, or set the `.lookup_field` '
        'attribute on the view correctly.' %
        (self.__class__.__name__, lookup_url_kwarg)
    )

    # 定义查询参数，这里最终会变成 {pk: 1}
    filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
    # 二次筛选查询对象，根据 pk 得到一个具体的记录对象，若查询不到则直接返回 404
    obj = get_object_or_404(queryset, **filter_kwargs)

    # 进行权限校验
    self.check_object_permissions(self.request, obj)

    # 返回记录对象
    return obj
```

3. get_serializer 方法：

```
def get_serializer(self, *args, **kwargs):
    """
    该方法实际上就是获取并调用序列化器
    运行后将结果返回
    """
    serializer_class = self.get_serializer_class()
    kwargs.setdefault('context', self.get_serializer_context())
    return serializer_class(*args, **kwargs)
```

4. get_serializer_class 方法：

```
def get_serializer_class(self):
    # 这里规定我们视图类中，应该定义一个 serializer_class 属性
    # 或者覆写 get_serializer_class 的方法
    assert self.serializer_class is not None, (
        "'%s' should either include a `serializer_class` attribute, "
        "or override the `get_serializer_class()` method."
        % self.__class__.__name__
    )

    # 返回该属性
    return self.serializer_class
```

### GenericAPIView 的封装特性

通过阅读上面的 4 个方法，我们得出了 4 个比较重要的属性和 4 个比较重要的方法。

4 个比较重要的属性：

```
- queryset：将要查询的数据表，类型应该是 QuerySet
- serializer_class：将要执行的序列化类
- lookup_field: 运行 get_object 方法获取单条记录对象的查询条件，默认是 pk
- lookup_url_kwargs: 若 url 具名捕获的查询条件不是 pk，应该在这里进行指定
```

4 个比较重要的方法：

```
get_queryset：获取所有记录，返回 QuerySet 对象
get_object：获取按照 lookup_field 属性查询到的单条记录对象
get_serializer_class: 获取序列化对象
get_serializer: 执行序列化对象
```

### 使用 GenericAPIView 书写接口

通过 GenericAPIView 书写视图代码：

```
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from . import models
from . import serializers


class BookAPI(GenericAPIView):
    # 如果数据表中有 is_delete，则此处可以筛选
    # 其实这里可以加 all，也可以不加 all
    queryset = models.Book.objects.all()

    serializer_class = serializers.BookSerializer

    # url 捕获的参数是 pk
    lookup_field = 'pk'

    # -------------------------------------------------

    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        # 获取单个书籍
        if pk:
            # 获取单个书籍，直接调用 self.get_object 方法即可
            book_object = self.get_object()
            # 存在该书籍
            if book_object:
                return Response(
                    # 获取和执行序列化器，直接调用 get_serializer 方法即可
                    self.get_serializer(book_object).data
                )

        # 获取所有的书籍，直接调用 self.get_queryset 方法即可
        book_queryset = self.get_queryset()
        return Response(
            self.get_serializer(book_queryset, many=True).data
        )

    def post(self, request, *args, **kwargs):
        # 创建书籍
        serializer = self.get_serializer(data=request.data)

        # 若验证失败，直接返回 400
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # 若验证成功，则返回 201，并返回创建的书籍
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        # 更新书籍
        book_object = self.get_object()

        serializer = self.get_serializer(
            instance=book_object,
            data=request.data,
            partial=True,
        )

        # 若验证失败，直接返回 400
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        # 删除书籍
        book_object = self.get_object()

        book_object.delete()

        # 删除成功，返回 204
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### GenericAPIView 书写接口的问题发现

相对于使用 APIView 来说，使用 GenericAPIView 不必再手动书写 ORM 查询语句。

但是对于返回信息、验证操作等都需要我们自己写。

## mixins 中的五个扩展类

### mixins 扩展类的继承关系

在 rest_framework.mixins 中有 5 个扩展类，使用这 5 个扩展类配合 GenericAPIView 使用有奇效。

这 5 个扩展类的导入如下：

```
from rest_framework.mixins import (
    ListModelMixin,      # 该类负责查询所有记录
    RetrieveModelMixin,  # 该类负责查询单条记录
    CreateModelMixin,    # 该类负责创建单条记录
    UpdateModelMixin,    # 该类负责更新单条记录
    DestroyModelMixin,   # 该类负责删除单条记录
)
```

这 5 个类都继承自 object，是相互独立的子类：

```
                                           ┌────────┐
                                           │ object │
                                           └────────┘
                     rest_framework.mixins     ▲
          ┌──────────────────┬─────────────────┼─────────────────┬───────────────────┐
 ┌────────┴─────────┐ ┌──────┴───────┐ ┌───────┴───────┐ ┌───────┴────────┐ ┌────────┴────────┐
 │RetrieveModelMixin│ │ListModelMixin│ │reateModelMixin│ │UpdateModelMixin│ │DestroyModelMixin│
 └──────────────────┘ └──────────────┘ └───────────────┘ └────────────────┘ └─────────────────┘
```

### mixins 扩展类的源码阅读

这 5 个扩展类的源码都非常简单，通过阅读源码你可以发现这 5 个扩展类都是配合 GenericAPIView 使用的。

因为 get_queryset、get_object 这些方法都是 GenericAPIView 才有的。

1. RetrieveModelMixin 类：

```
class RetrieveModelMixin:
    """
    Retrieve a model instance.
    """
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
```

2. ListModelMixin 类：

```
class ListModelMixin:
    """
    List a queryset.
    """
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # 做分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

3. CreateModelMixin 类：

```
class CreateModelMixin:
    """
    Create a model instance.
    """
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # 保存结果
        self.perform_create(serializer)
        # 设置响应头
        headers = self.get_success_headers(serializer.data)
        # 返回 201
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def get_success_headers(self, data):
        try:
            return {'Location': str(data[api_settings.URL_FIELD_NAME])}
        except (TypeError, KeyError):
            return {}
```

4）UpdateModelMixin 类：

```
class UpdateModelMixin:
    """
    Update a model instance.
    """
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        # 针对 patch 请求，应该使用该方法
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
```

5. DestroyModelMixin 类：

```
class DestroyModelMixin:
    """
    Destroy a model instance.
    """
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        # 删除成功后返回的是 204 状态码
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()
```

### mixins 扩展类的 6 个方法

我们可以发现，在 rest_framework.mixins 中五种不同的类都有不同的方法，针对请求方式的不同我们可以直接调用这些方法并返回。

如下图所示：

| 请求   | 对应类和方法                    | 描述         |
| ------ | ------------------------------- | ------------ |
| GET    | RetrieveModelMixin.retrieve     | 查询单条记录 |
| GET    | ListModelMixin.list             | 查询所有记录 |
| POST   | CreateModelMixin.create         | 创建单条记录 |
| PATCH  | UpdateModelMixin.partial_update | 更新单条记录 |
| PUT    | UpdateModelMixin.update         | 更新单条记录 |
| DELETE | DestroyModelMixin.destroy       | 删除单条记录 |

### 使用 GenericAPIView + mixins 扩展类书写接口

通过 GenericAPIView 以及五个 mixins 扩展类书写视图代码：

```
class BookAPI(
    GenericAPIView,
    RetrieveModelMixin,
    ListModelMixin, CreateModelMixin,
    UpdateModelMixin, DestroyModelMixin
):
    queryset = models.Book.objects.all()

    serializer_class = serializers.BookSerializer

    lookup_field = 'pk'

    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if pk:
            return self.retrieve(request, *args, **kwargs)
        # 查询所有
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
```

### GenericAPIView + mixins 扩展类书写接口的问题发现

相较于只使用 APIView 和 GenericAPIView，这样书写视图代码量少了非常非常多。

但是存在 2 个问题，第一个问题是视图类需要继承的类太多了，第二个问题是我们需要在每一个请求方法后手动 return，那么有没有一种办法让它能够帮助我们自动 return 呢？

## 使用 ModelViewSet

### ModelViewSet 的继承关系

ModelViewSet 的导入如下：

```
from rest_framework.viewsets import ModelViewSet
```

ModelViewSet 是 GenericAPIView 和 mixins 中的 5 个扩展类的派生类，以下是它的继承图：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20201028174903534.png)

### GenericViewSet 是什么

rest_framework.viewsets.GenericViewSet 中其实什么都没有，但是它继承了 ViewSetMixin：

```
class GenericViewSet(ViewSetMixin, generics.GenericAPIView):
    """
    GenericViewSet 类默认不提供任何动作，
    但确实包括通用视图行为的基本集，例如
    `get_object` 和 `get_queryset` 方法。
    """
    pass
```

### ViewSetMixIn 与 actions 属性

rest_framework.viewsets.ViewSetMixin 非常重要。首先它对 as_view 方法进行了覆写：

```
class ViewSetMixin:

    @classonlymethod
    def as_view(cls, actions=None, **initkwargs):
        """
        相较于 APIView，ViewSetMixin 多了一个 actions 的关键字参数
        这个关键字参数设计的非常巧妙
        因为我们知道 mixins 的 5 个扩展类总提供了 6 种方法
        但这些方法的名称都不是按请求方式命名的，而是按照行为命名
        如：
            retrieve
            list
            create
            partial_update
            update
            destroy
        这会造成一个问题， 比如 POST 请求该运行那个方法呢？
        GET 请求需要运行那个方法呢？

        所以，这需要我们通过 actions 来指定。
        比如：
            path("api/book/", views.BookAPI.as_view(actions={"get": "list", "post": "create"}))
            path("api/book/<int:pk>/", views.BookAPI.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}))
        这就是 actions 的作用了
        """

        ...

        # 这里规定我们必须传入 actions 参数，否则将抛出异常
        if not actions:
            raise TypeError("The `actions` argument must be provided when "
                            "calling `.as_view()` on a ViewSet. For example "
                            "`.as_view({'get': 'list'})`")

        def view(request, *args, **kwargs):

            ...

            # 核心代码：通过循环 actions 得到该执行那个方法
            for method, action in actions.items():
                handler = getattr(self, action)
                setattr(self, method, handler)

            ...

            return self.dispatch(request, *args, **kwargs)

        ...

        return csrf_exempt(view)
```

### 使用 ModelViewSet 书写接口

通过 ModelViewSet 来书写 API 接口会变得非常简单：

视图代码：

```
from rest_framework.viewsets import ModelViewSet

from . import serializers
from . import models


class BookAPI(ModelViewSet):
    queryset = models.Book.objects.all()
    serializer_class = serializers.BookSerializer
    lookup_field = 'pk'

    def bluk_create(self, request, *args, **kwargs):
        # 在这里可以手动书写批量创建的逻辑
        return Response("bluk create")

    def bluk_update(self, request, *args, **kwargs):
        # 在这里可以手动书写批量更新的逻辑
        return Response("bluk update")

    def secondary_verification(self, request, *args, **kwargs):
        # 在这里可以手动书写需要二次验证才能访问的逻辑
        return Response("secondary verification")
```

路由关系映射需要修改：

```
from django.urls import path

from app01 import views

urlpatterns = [
    path("api/book/",
         views.BookAPI.as_view(actions={"get": "list", "post": "create"})),
    path("api/book/<int:pk>/", views.BookAPI.as_view(
        {"get": "retrieve", "patch": "partial_update", "delete": "destroy"})),
    path("api/book/bluk/",
         views.BookAPI.as_view({"post": "bluk_create", "patch": "bluk_update"}))
]
```

## 使用 generics 扩展类

rest_framework.generics 模块中除开 GenericAPIView 外，还有一些其它的扩展类。

共有 9 个，它们都是结合了 GenericAPIView 和 mixins 中某些扩展类，所以天生具备某些功能。

如下所示：

```
# 只支持创建单条记录
 CreateAPIView
└─ post
 ListAPIView
# 只支持获取所有记录
└─ get
 RetrieveAPIView
# 只支持获取单条记录
└─ get
 DestroyAPIView
# 只支持删除单条记录
└─ delete
 UpdateAPIView
# 同时支持 PUT 和 PATCH 更新单条记录
├─ put
└─ patch
 ListCreateAPIView
# 同时支持创建单条和查询所有记录
├─ get
└─ post
 RetrieveUpdateAPIView
# 同时支持创建单条、PATCH 更新和查询所有记录
├─ get
├─ put
└─ patch
 RetrieveDestroyAPIView
# 同时支持查询单条和删除单条记录
├─ get
└─ delete
 RetrieveUpdateDestroyAPIView
# 同时支持获取、PUT 或 PATCH 更新、删除单条记录
├─ get
├─ put
├─ patch
└─ delete
```

要使用它们非常简单，只需要继承其中某个视图类即可。

不需要使用 actions 更改视图行为。

以 RetrieveDestroyAPIView 举例，视图代码如下：

```
from rest_framework.generics import RetrieveDestroyAPIView
from . import serializers
from . import models


class BookAPI(RetrieveDestroyAPIView):
    """
    支持查询、删除图书
    """
    queryset = models.Book.objects.all()
    serializer_class = serializers.BookSerializer
    lookup_field = 'pk'
```

路由关系映射：

```
from django.urls import path

from app01 import views

urlpatterns = [
    path("api/book/<int:pk>/", views.BookAPI.as_view()),
]
```

## 如何使用自定义 Response

在使用 ModelViewSet 时，我们可能会想返回自己定义的 Response，其实也非常简单。

只需要把视图稍微修改一下，加上一个装饰器即可：

```
from django.utils.decorators import method_decorator

from rest_framework.viewsets import ModelViewSet

from . import serializers
from . import models


def custom_response(name):
    def inner(func):
        actions = {
            "get": "get",
            "post": "create",
            "put": "update",
            "patch": "update",
            "delete": "delete"
        }

        def wrapper(request, *args, **kwargs):
            res = func(request, *args, **kwargs)
            pk = kwargs.get('pk')
            action = actions.get(request.method.lower())
            if res.status_code < 400:
                res.data = {
                    "status": 1,
                    "message": f'{action} {name} ' + (f"id {pk} " if pk else "") + 'success',
                    "data": res.data
                }
            else:
                res.data = {
                    "status": 0,
                    "message": f"{action} {name} fail, id {pk} {res.data['detail']}".lower(),
                    "data": None
                }
            return res
        return wrapper
    return inner


class BookAPI(ModelViewSet):
    queryset = models.Book.objects.all()
    serializer_class = serializers.BookSerializer
    lookup_field = 'pk'

    # 传入名称
    @method_decorator(custom_response("book"))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
```

最终结果：

```
1. 查询不存在的书籍

{
	"status": 0,
	"message": "get book fail, id 10000 not found.",
	"data": null
}

2. 查询存在的书籍

{
	"status": 1,
	"message": "get book id 2 success",
	"data": {
		"id": 2,
		"title": "java",
		"author": "lisi",
		"price": "200.00"
	}
}

3. 查询所有书籍

{
	"status": 1,
	"message": "get book success",
	"data": [
		{
			"id": 2,
			"title": "java",
			"author": "lisi",
			"price": "200.00"
		},
		{
			"id": 3,
			"title": "go",
			"author": "wangwu",
			"price": "300.00"
		}
	]
}
```
