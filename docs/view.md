# View

## 视图书写

### FBV

rest_framework 中支持以 FBV 方式书写视图，但必须导入 rest_framework.decorator 所提供的 api_view 装饰器。

代码示例：

```
from rest_framework.response import Response

from rest_framework.decorators import api_view


@api_view(["GET", "POST"])
def fbv_example(request):
    # 注意：如果是其它请求方式，会直接返回 405
    # HTTP_405_METHOD_NOT_ALLOWED = 405
    if request.method == "GET":
        return Response(
            data={
                "status": 1,
                "message": "This is a GET request",
                "data": [],
            }
        )

    return Response(
        data={
            "status": 1,
            "message": "This is a POST request",
            "data": [],
        }
    )
```

手动书写路由映射：

```
from django.contrib import admin
from django.urls import path

from app01 import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/fbv_example/', views.fbv_example),
]
```

代码测试：

```
GET | POST http://127.0.0.1:8000/api/fbv_example/
```

### CBV

在 rest_framework 中我们更推荐使用 CBV 形式书写视图，且自定义的 View 类必须继承 views.APIView 类。

代码示例：

```
from rest_framework.response import Response

from rest_framework.views import APIView


class CBVExample(APIView):
    def get(self, request):
        return Response(
            data={
                "status": 1,
                "message": "This is a GET request",
                "data": [],
            }
        )

    def post(self, request):
        return Response(
            data={
                "status": 1,
                "message": "This is a POST request",
                "data": [],
            }
        )
```

手动书写路由映射：

```
from django.contrib import admin
from django.urls import path

from app01 import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/cbv_example/', views.CBVExample.as_view()),
]
```

代码测试：

```
GET | POST http://127.0.0.1:8000/api/cbv_example/
```

## 源码解析

### 继承关系

rest_framework 插件所提供的 APIView 类是 Django 原生 View 类的派生子类：

```
class APIView(View):
    ....
```

它覆写了 Django 原生 View 类中的一些方法或属性：

```
from rest_framework.views import APIView

from django.views import View

print(
    list(
        filter(
            lambda x: not x.startswith("_"),
            set.intersection(set(dir(View)), set(dir(APIView)))
        )
    )
)

# ['setup', 'http_method_not_allowed', 'options', 'as_view', 'http_method_names', 'dispatch']
```

### as_view 方法

APIView 类中的 as_view 方法会在启动 Django 服务后自动运行：

```
    @classmethod
    def as_view(cls, **initkwargs):
        if isinstance(getattr(cls, 'queryset', None), models.query.QuerySet):
            def force_evaluation():
                raise RuntimeError(
                    'Do not evaluate the `.queryset` attribute directly, '
                    'as the result will be cached and reused between requests. '
                    'Use `.all()` or call `.get_queryset()` instead.'
                )
            cls.queryset._fetch_all = force_evaluation

        view = super().as_view(**initkwargs)  # 运行 Django 原生 View 类的 as_view 方法
        view.cls = cls  # cls 即自定义的 CBV View 类
        view.initkwargs = initkwargs  # 初始化参数

        return csrf_exempt(view)  # 取消 csrf 认证，返回 Django 原生的 as_view 方法的返回值（一个闭包函数）
```

Django 原生 View 类的 as_view 方法：

```
    @classonlymethod
    def as_view(cls, **initkwargs):
        for key in initkwargs:
            if key in cls.http_method_names:
                raise TypeError(
                    'The method name %s is not accepted as a keyword argument '
                    'to %s().' % (key, cls.__name__)
                )
            if not hasattr(cls, key):
                raise TypeError("%s() received an invalid keyword %r. as_view "
                                "only accepts arguments that are already "
                                "attributes of the class." % (cls.__name__, key))

        def view(request, *args, **kwargs):  # 实际上就是返回该闭包函数， rest_framework 会取消本次请求的 csrf 认证
            self = cls(**initkwargs)
            self.setup(request, *args, **kwargs)
            if not hasattr(self, 'request'):
                raise AttributeError(
                    "%s instance has no 'request' attribute. Did you override "
                    "setup() and forget to call super()?" % cls.__name__
                )
            return self.dispatch(request, *args, **kwargs)
        view.view_class = cls
        view.view_initkwargs = initkwargs

        view.__doc__ = cls.__doc__
        view.__module__ = cls.__module__
        view.__annotations__ = cls.dispatch.__annotations__
        view.__dict__.update(cls.dispatch.__dict__)

        return view
```

### dispatch 方法

由 as_view 方法返回的闭包函数 view 会在 request 请求到来时自动运行，其内部会执行 dispatch 方法。

可以从 APIView 中寻找该方法：

```
    def dispatch(self, request, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        # 先执行该方法，得到一个经过封装的 request 对象，并赋值给 self
        request = self.initialize_request(request, *args, **kwargs)
        self.request = request
        self.headers = self.default_response_headers  # deprecate?

        try:
            # 再执行该方法，这里传入的是原生的 request 对象，并非是由执行 initialize_request 方法所返回的 request 对象
            self.initial(request, *args, **kwargs)

            if request.method.lower() in self.http_method_names:
                handler = getattr(self, request.method.lower(),
                                  self.http_method_not_allowed)
            else:
                handler = self.http_method_not_allowed

            response = handler(request, *args, **kwargs)

        except Exception as exc:
            # 若在执行过程中发生异常，则对异常进行处理
            response = self.handle_exception(exc)

        # 对返回的 response 对象做包装
        self.response = self.finalize_response(request, response, *args, **kwargs)
        return self.response
```

### initialize_request 方法

APIView 类中的 initialize_request 方法主要负责实例化出一个 Request 对象：

```
    def initialize_request(self, request, *args, **kwargs):
        parser_context = self.get_parser_context(request)

        return Request(
            request,
            parsers=self.get_parsers(),
            authenticators=self.get_authenticators(),
            negotiator=self.get_content_negotiator(),
            parser_context=parser_context
        )
```

该 Request 类是由 rest_framework 插件所提供的，在第 15 行可以验证：

```
from rest_framework.request import Request
```

### initial 方法

APIView 类中的 initial 方法在执行时传入的是原生的 request 对象，并不是由 initialize_request 方法执行后所返回的请求对象：

```
    def initial(self, request, *args, **kwargs):
        self.format_kwarg = self.get_format_suffix(**kwargs)

        neg = self.perform_content_negotiation(request)
        request.accepted_renderer, request.accepted_media_type = neg

        version, scheme = self.determine_version(request, *args, **kwargs)
        request.version, request.versioning_scheme = version, scheme

        # 执行身份认证，是否已登录？
        self.perform_authentication(request)
        # 执行权限认证，是否可浏览？
        self.check_permissions(request)
        # 执行频率认真，是否太频繁？
        self.check_throttles(request)
```

目前源码分析看到这里就差不多了，后面的 rest_framework 请求执行流程会在接下来的文章中介绍。
