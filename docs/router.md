# Router

## 基本介绍

rest_framework 框架中，ModelViewSet 应该是我们最常使用的一种视图集类。

ModelViewSet 有别于其它的视图集，它是通过 actions 来规定每种请求到来时应该执行什么方法。

这意味着我们在使用 ModelViewSet 时必须手动指定路由关系映射中的 actions，这很麻烦：

```
urlpatterns = [
    path("api/book/",
         views.BookAPI.as_view(actions={"get": "list", "post": "create"})),
    path("api/book/<int:pk>/", views.BookAPI.as_view(
        {"get": "retrieve", "patch": "partial_update", "delete": "destroy"})),
]
```

故此，rest_framework 专门针对 ModelViewSet 提供了 SimpleRouter 和 DefaultRouter，能够非常快速的生成路由映射以及 actions。

## 手动封装路由

我们也可以手动封装一个路由生成器，代码如下：

```
from django.urls import path, include
from app01 import views

from rest_framework.routers import SimpleRouter


class GenerateRouter:
    def __init__(self, trailing_slash=True):
        self.trailing_slash = '/' if trailing_slash else ''
        self.urls = []

    def register(self, prefix, viewset, basename=None):
        """
        @prefix: url 前缀
        @viewset: 视图集
        @basename: 基础路由名称
        """
        from django.urls import re_path
        basename = basename or viewset.serializer_class.Meta.model.__name__.lower()

        self.urls = [
            # 不需要传入参数，查询全部和新增
            re_path(
                f"^{prefix}{self.trailing_slash}$",
                viewset.as_view(actions={'get': 'list', 'post': 'create'}),
                name=f"{basename}-list"
            ),
            # 需要传入参数，查询单个，更新，删除
            re_path(
                f"^{prefix}/(?P<{viewset.lookup_url_kwarg or viewset.lookup_field}>[^/.]+){self.trailing_slash}$",
                viewset.as_view(actions={
                                'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
                name=f"{basename}-detail"
            )
        ]


# 实例化路由器
router = GenerateRouter()
# 注册路由器
router.register('book', views.BookAPI)
# 合并路由器
urlpatterns = [
    path("api/", include(router.urls)),
]

# 如果不需要 api 前缀，也可以这样写

# urlpatterns += router.urls
# urlpatterns.extend(router.urls)
```

最终生成了 2 条路由规则：

```
api/ ^book/$ [name='book-list']
api/ ^book/(?P<pk>[^/.]+)/$ [name='book-detail'] 
```

## SimpleRouter

rest_framework 中提供了 SimpleRouter 简单路由。

它和我们上面自定义的路由生成器类似，都是生成 2 条路由。

使用如下：

```
from django.urls import path, include
from app01 import views

# 导入简单路由
from rest_framework.routers import SimpleRouter

# 实例化路由器
router = SimpleRouter()
# 注册路由器
router.register('book', views.BookAPI)
# 合并路由器
urlpatterns = [
    path("api/", include(router.urls)),
]

# 如果不需要 api 前缀，也可以这样写

# urlpatterns += router.urls
# urlpatterns.extend(router.urls)
```


最终生成了 2 条路由规则：

```
api/ ^book/$ [name='book-list']
api/ ^book/(?P<pk>[^/.]+)/$ [name='book-detail'] 
```

## DefaultRouter

rest_framework 中还提供了 DefaultRouter 默认路由。

它可以一次性生成 6 条路由规则。

代码如下：

```
from app01 import views

# 导入默认路由
from rest_framework.routers import DefaultRouter

# 实例化路由器
router = DefaultRouter()
# 注册路由器
router.register('api/book', views.BookAPI)
# 合并路由器
urlpatterns = [
]

urlpatterns += router.urls
# urlpatterns.extend(router.urls)
```

生成的路由规则如下：

```
^api/book/$ [name='book-list']
^api/book\.(?P<format>[a-z0-9]+)/?$ [name='book-list']
^api/book/(?P<pk>[^/.]+)/$ [name='book-detail']
^api/book/(?P<pk>[^/.]+)\.(?P<format>[a-z0-9]+)/?$ [name='book-detail']
^$ [name='api-root']
^\.(?P<format>[a-z0-9]+)/?$ [name='api-root']
```

## action 装饰器

rest_framework 中为每个 ViewSetMixin（这是 ModelViewSet 的超类） 视图类提供了单独添加路由的方式。

如下示例：

```
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet


from . import serializers
from . import models

class BookAPI(ModelViewSet):
    queryset = models.Book.objects.all()

    serializer_class = serializers.BookSerializer
    lookup_field = 'pk'

    @action(methods=["GET", "POST"], detail=False)
    def test(self, request, *args, **kwargs):
        return Response("test ok")

    # methods: 允许请求的方法
    # detail: 是否需要捕获参数，True 表示需要捕获参数，False 表示不需要捕获参数
    # url_path: 该路由的匹配规则，默认是函数名称
```

最终生成的路由是（简单路由）：

```
^api/book/$ [name='book-list']
^api/book/test/$ [name='book-test']
^api/book/(?P<pk>[^/.]+)/$ [name='book-detail']
```
