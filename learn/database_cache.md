1. 谈谈你对 HTTP 协议的认识：

```
HTTP 协议全称为 Hypertext Transfer Protocol，中文译为超文本传输协议。
这意味着它不光可以传输文本，还可以传输图片、视频等数据。

HTTP 协议有以下一些特点：

基于 请求/响应： 一次请求对应一次响应
基于 TCP/IP 协议：HTTP 协议是应用层的协议，基于传输层的 TCP 协议以及网络层的 IP 协议
无链接特性：每次请求完成后都会断开链接（1.1 版本之前）
无状态特性：每次请求对服务器而言都是陌生的，服务器不会记忆请求特征
```

2. 谈谈你对 websocket 协议的认识：

```
不同于 HTTP 协议，websocket 是一种双向主动的协议。
Server 端可以向 Client 端主动发送请求，而 Client 端也可以主动向 Server 端发送请求。
```

3. 什么是 magic string？

```
magic string 是一个固定的值：

258EAFA5-E914-47DA-95CA-C5AB0DC85B11

用于在 websocket 建立链接请求之前验证 Client 端和 Server 端之间的通信是否安全。

下面是 websocket 建立链接的流程：

1. Server 端开启监听
2. Client 端请求建立链接
3. Server 端和 Client 端之间建立 3 次握手，确认链接建立
4. Client 端生成一个随机字符串，然后会向服务器发送一次请求，并且会在请求头中携带上这个随机字符串（request header name : Sec-WebSocket-Key）
5. Server 端接收到该请求，解码出随机字符串后通过 sha1 进行加密该字符串，此时 magic string 会当作 salt 被添加到加密字符串中，加密完成后再通过 base64 编码该字符串，最后 Server 端会将这个字符串重新发送回 Client 端
6. Client 端会进行验证，将 Server 端发送的字符串接收并通过 base64 解码，然后将 本地随机字符串 + magic string 进行 sha1 加密对比，如果相同则代表 websocket 能够成功建立
```

4. 如何创建响应式布局？

```
1. 使用媒体查询 Media Queries
2. 使用 rem 、 vw 以及 vh 等相对的尺寸单位
3. 添加上 meta 的 viewport 标签
```

5. 你曾经使用过那些前端框架？

```
UI 框架：
    1. bootstrap
    2. element-ui
```

6. 什么是 ajax 请求？ 使用 jQuery 和 XMLHttpRequest 对象实现一个 ajax 请求：

```
ajax 是一种历史悠久的网络请求方案，它能够实现在页面不刷新的同时与后端进行数据交互。

1. XMLHttpRequest 原生发送 POST 请求：

"use strict";

let xhr = new XMLHttpRequest();

// 绑定回调函数
xhr.addEventListener("readystatechange", () => {
    switch (xhr.readyState) {
        case 0:
            console.log("未初始化，尚未调用open()方法");
            break
        case 1:
            console.log("已初始化，调用了open()方法，但还未调用send()方法");
            break
        case 2:
            console.log("已发送，调用了send()方法，但还未收到服务端响应");
            break
        case 3:
            console.log("已接收，已经收到了部分服务端响应数据");
            break
        default:
            console.log("已完成，已经收到了全部服务端响应数据");
            if (xhr.statusText === "OK") {
                console.log("请求成功");
                console.log(xhr.status);
                console.log(xhr.statusText);
                console.log(xhr.responseText);
            } else {
                console.log("请求失败");
                console.log(xhr.status);
                console.log(xhr.statusText);
                console.log(xhr.responseText);
            }
    }
})

// 请求方式，请求地址与参数，是否开启异步提交
xhr.open("POST", "http://localhost:5700/post", true);

// 设置请求头，提交的数据格式为url编码
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset-UTF-8');
xhr.setRequestHeader('user_head', 'HELLO WORLD');

// 发送请求，提交的数据格式为url编码
xhr.send("username=Jack&userage=18");


2. jQuery 发送 POST 请求：

$.ajax({
        url: "http://localhost:5700/get",
        method: "GET",
        dataType: "JSON",
        headers: { "user_head": "Hello World" },
        data: { name: "Jack", age: 18, gender: "male" },
        success: (data, textStatus) => {
            console.log("成功");
            console.log(data);
            console.log(textStatus);
        },
        error: (jqXHR, textStatus) => {
            console.log("失败");
            console.log(jqXHR);
            console.log(textStatus);
        },
        complete: (jqXHR, textStatus) => {
            console.log("总是执行");
            console.log(jqXHR);
            console.log(textStatus);
        },
    })

```

7. 如何在前端实现轮训？

```
前端通过 setInterval 不断的向后端发起请求，后端不断的响应请求。
```

8. 如何在前端实现长轮训？

```
后端为每个请求创建一个专属的通道，当有新消息放进来后立即返回所有信息。
若通道长时间没有消息返回，则等待，直到请求通道中有新的信息时再响应请求，若超时则捕获异常再响应本次的请求。
```

9. Vuex 的作用？

```
Vuex 相当于一个数据仓库，由于 props 与 $emit 通信必须维持单向数据流的特性（一层一层传递）。若项目过于庞大组件的层级较多时，会造成后期的维护困难问题。

而 Vuex 则将数据和组件剥离，组件树中的所有组件都可以直接访问数据仓库获取、发送数据，同时组件树中任何一个组件对数据的修改都将作用到所有的组件身上。
```

10. Vue 中的路由拦截器的作用？

```
Vue 中每个组件的切换都需要经历 2 个阶段，分别是 before 和 after。

- beoferEach：被称为前置守卫，对组件切换前的行为进行检查，检查通过后必须调用 next 方法才能继续切换，否则将拦截本次切换
- afterEach：被称为后置守卫，对切换后的组件做善后工作，可以理解为路由切换组件时最后运行的一个 hook function

一般路由拦截器是指 beforeEach
```

11. axios 的作用？

```
axios 是一款网络请求库，相较于 jQuery.ajax 来说它更智能，如在上传文件时可以直接忽略 contentType 的设置等等 ..
```

12. 举例 Vue 的常见指令？

```
v-once
v-text
v-html
v-show
v-pre
v-cloak
v-bind
v-on
v-for
v-if
v-model
```

13. 简述 JSONP 及其实现原理？

```
JSONP 是为了解决 CORS（同源策略）的一种技术手段。

JSONP 适用于请求一些服务器上的公共开放接口，并不适用于内部项目开发，也就是说只有当你需要去某个服务器上取出一些开放数据时这项技术才会被使用到。

它的实现方案就是通过一些特定标签突破同源策略的限制（比如 <script> <form> 这些标签就会无视同源策略）。然后通过与 Server 端的约定，运行特定的 callback 函数获得数据。

下面是一个 JSONP 的源代码实现：

后端：

from logging import debug, error
from flask import Flask
import random

app = Flask(__name__)

@app.route(rule="/", methods=["GET"], strict_slashes=False)
def publicAPI():
    number = random.randint(1, 100)
    return f"callbackfn({number})"

if __name__ == "__main__":
    app.run(host="localhost", port=5700, debug=True)

前端：

<body>
    <button type="button">click me</button>
    <p><span></span></p>

    <script>
        "use strict";

        let btnNode = document.querySelector("button");
        let spanNode = document.querySelector("span");

        btnNode.addEventListener("click", (event) => {
            let scriptNode = document.createElement("script");
            scriptNode.src = "http://localhost:5700/";
            document.head.append(scriptNode);
            document.head.removeChild(scriptNode);
        })

        function callbackfn(result) {
            spanNode.innerText = result;
        }
    </script>
</body>
```

14. 什么是 CORS？

```
所有支持 JavaScript 的浏览器都不允许跨域请求资源的情况出现，这种策略被称为同源策略（Same origin policy）。

所谓同源无外乎同协议、同域名、同端口。

比如你在 http://localhost:5500 下发送一个请求去获取 http://localhost:5700/的资源时浏览器就会触发同源策略对服务端响应进行拦截。
```

15. 例举 HTTP 请求中常见的请求方式？

```
- GET
- POST
- PUT
- PATCH
- DELETE
- HEAD
```

16. 例举 HTTP 请求中的状态码？

```
200 ok [GET]
    服务器成功执行客户端请求（该操作是幂等的）
201 create [POST/PUT/PATCH]
    服务器成功执行客户端的新建资源、更新资源请求
202 accepted [*]
    服务器成功将客户端请求加入任务队列
204 no content [DELETE]
    服务器成功执行客户端的删除资源请求

400 invalid request [POST/PUT/PATCH]
    服务器并未成功执行客户端的新建资源、更新资源请求，客户端发出的请求指令有误（该操作是幂等的）
401 unauthorized [*]
    服务器并未成功执行客户端的请求，因为客户端没有权限，这可能是令牌、用户名、密码错误所导致的
403 forbidden [*]
    服务器并未成功执行客户端的请求，客户端权限验证尽管已经通过，但该操作是禁止的（与 401 相对）
404 not found [*]
    服务器并未成功执行客户端的请求，因为客户端所请求的资源是不存在的（该操作是幂等的）
406 not acceptable [GET]
    服务器并未成功执行客户端的请求，因为客户端所请求的格式是不被支持的（如客户端请求的是 XML 格式数据，但服务端只提供了 JSON 格式的数据）
410 gone [get]
    服务器并未成功执行客户端的请求，因为客户端所请求的资源被永久删除且不会再恢复了
422 unprocesable entity [POST/PUT/PATCH]
    服务器并未成功执行客户端的新建资源、更新资源请求，因为服务端在处理请求时发生了验证错误

500 internal server error [*]
    服务器并未成功执行客户端的请求，因为服务器内部发生了错误，此时客户端将无法判断发出的请求是否有效
```

17. 例举 HTTP 请求中常见的请求头？

```
Accept: 指定客户端能够接收的内容类型
Accept-Charset： 指定客户端能接收的字符编码集
Accept-Encoding： 指定客户端支持的 WEB 服务器所返回内容的压缩编码类型
Accept-Language： 指定客户端所能够接受的语言
Authorization： HTTP 授权的授权证书
Connection： 指定是否需要持久链接（需要 HTTP 1.1+ 版本）
Cookie：HTTP 请求所携带的 cookie
Content-Type：指定请求实体的 MIME 信息
User-Agent：包含本次请求的用户信息
Referer： 本次请求来自那个站点
```

18. 看图写结果：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220528234151.png)

```
李杰
```

19. 看图写结果：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220528234340.png)

```
武沛齐
```

20. 看图写结果：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220528234018.png)

```
老男孩
```

21. 看图写结果：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220528234720.png)

```
undefined
```

22. 看图写结果：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220528234913.png)

```
武沛齐
```

23. 看图写结果：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220528235024.png)

```
undefined
```

24. django、flask、tornado 等框架的区别：

```
django： 大而全，socket 部分使用现成的 wsgiref 模块，路由机制由自己定义，模板有专门的 DjangoTemplate
flask： 小而精，socket 部分使用现成的 werkzeug 模块，路由机制由自己定义，模板使用现成的 jinja2
tornado：速度快，socket、路由机制、模板均由自己实现
```

25. 什么是 WSGI？

```
Python WEB 应用程序与 WEB 服务器之间的一种接口。

它其实就是一种规范，规定 WEB 服务器如何与 Python WEB 应用程序进行交互。
```

26. Django 请求的生命周期？

```
1. 浏览器发送请求
2. WSGI 创建 socket 服务器，接收请求
3. 中间件处理请求
4. 寻找路由映射的视图函数
5. 执行视图函数，进行业务处理（ORM 处理数据，view 将数据渲染到 template 模板）
6. 中间件响应处理
7. WSGI 返回响应
8. 浏览器渲染
```

27. 例举 Django 的内置组件

```
auth 组件
form 组件
models 组件
admin 组件
...
```

28. 例举 Django 中间件的 5 个方法？以及 Django 中间件的应用场景？

```
process_request(self, request)： 请求到来时执行
process_view(self, request, view_func, view_args, view_kwargs): 运行视图函数前执行（路由匹配完成后）
process_exception(self, request, exception): 发生异常时执行
process_template_response(self, request, response): render 方法运行完毕后执行
process_response(self, request, response): 响应请求时执行
```

29. 简述什么是 FBV 和 CBV？

```
fbv: 用函数书写视图函数，不能自动识别请求方式
cbv：用类书写视图函数，能够自动识别请求方式
```

30. Django 的 Request 对象是在什么时候创建的？

```
当页面每次被请求时 Django 就会创建一个 HttpRequest 对象
```

31. 如何给 CBV 的程序添加装饰器？

```
通过 method_decorator 添加装饰器：

from django.utils.decorators import method_decorator


from django.views import View
from django.utils.decorators import method_decorator
from django.http import HttpResponse


def decorator(func):
    def inner(request, *args, **kwargs):
        print("decorator running")
        return func(request, *args, **kwargs)
    return inner


class Index(View):

    @method_decorator(decorator)
    def dispatch(self, request, *args, **kwargs):
        # 钩子函数
        print("run dispatch")
        return super(__class__, self).dispatch(request, *args, **kwargs)

    def get(self, request):
        # GET 自动运行该方法
        return HttpResponse("get")

    def post(self, request):
        # POST 自动运行该方法
        return HttpResponse("post")
```

32. 例举 Django orm 中的所有方法（QuerySET 对象的所有方法）：

```
all         - 获取所有记录对象，返回 queryset
filter      - 过滤出符合条件的记录对象，返回 queryset
get         - 获取第一个指定条件的记录对象，返回 object
values      - 获取 queryset 中所有记录对象的值，返回 <Queryset [{k:v}, {k:v}, {k:v}]>
values_list - 获取 queryset 中所有记录对象的值，返回 <Queryset [(v1, v2), (v1, v2), (v1, v2)]>
distince    - 指定字段对 queryset 去重，返回 <Queryset [{k:v}, {k:v}, {k:v}]>
order_by    - 根据指定字段排序
reverse     - 必须先排序后才能反转
exclude     - 除开符合条件的记录不拿，其它都拿
count       - 返回记录的个数
exists      - 返回记录是否存在
first       - 返回 queryset 中的第一条记录对象
last        - 返回 queryset 中的最后一条记录对象
aggregate   - 聚合查询
```

33. only 和 defer 的区别？

```
only        - 只拿指定字段，如果要查询其它字段则会查询 2 次
defer       - 只拿指定字段以外的字段，如果要查询指定字段则会查询 2 次
```

34. select_related 和 prefetch_related 的区别？

```
- select_related： 如果跨表查询不使用 select_related 则会查询 2 次，而使用 select_related 只会查询一次，内部会通过 JOIN 连表
- prefetch_related： 子查询，会走 2 次查询，不用拼虚拟表

如果要从多张表中取出很多数据，可以使用 select_related，若只取出少量数据，则可以用 prefetch_related
```

35. filter 和 exclude 的区别？

```
filter      - 过滤出符合条件的记录对象，返回 queryset
exclude     - 除开符合条件的记录不拿，其它都拿
```

36. 例举 Django orm 中 3 种能书写 SQL 语句的方法：

```
1. 通过 connection 来书写原生 SQL 查询，返回列表
2. 通过 raw 来书写原生 SQL 查询，返回模型类
3. 通过 extra 来书写原生 SQL 构建子查询
```

37. Django orm 中如何设置读写分离？

```
1）在 settings.py 中添加多个库：

DATABASE = {
    "db1": {
        ...
    },
    "db2": {
        ...
    },
    ...
}

2）新建 db_router.py 脚本：

import random

class DBRouter:
    def db_for_read(self, model, **hints):
        # 读
        return random.choice(["db2", "db3", "db4"])

    def db_for_write(self, model, **hints):
        # 写
        return "db1"

3）在 settings.py 中指定 db_router：

DATABSE_ROUTERS = ["mysite_project.db_router.DBRouter"]
```

38. F 和 Q 的作用？

```
F 能拿到查询的字段本身的数据，可以做数据的自操作，如在原本的基础上增加或减少
Q 是能够让 filter 中的字段使用 OR 和 NOT 的逻辑操作

filter(Q(col=xxx), Q(col=xxx))    # AND
filter(!Q(col=xxx), !Q(col=xxx))  # NOT
filter(~Q(col=xxx), ~Q(col=xxx))  # OR
```

39. values 和 values_list 的区别？

```
values      - 获取 queryset 中所有记录对象的值，返回 <Queryset [{k:v}, {k:v}, {k:v}]>
values_list - 获取 queryset 中所有记录对象的值，返回 <Queryset [(v1, v2), (v1, v2), (v1, v2)]>
```

40. 如何使用 Django orm 批量创建数据？

```
通过 Queryset 的 bulk_create 方法：

models.Books.objects.bulk_create([obj, obj, obj])
```

41. Django 的 Form 和 ModelForm 的区别？

```
Form 组件提供了数据验证功能
ModelForm 组件提供了数据验证及持久化保存到数据库的功能，是 Form 组件和 Model 组件的结合体，类似于 DRF Serializers
```

42. Django 的 Form 组件中，如果字段中包含 choices 参数，请用 2 种方式实现数据源的实时更新：

```
1. 将字段定义为实例属性而不是类属性

class UserForm(Form):
      ut_id = fields.ChoiceField(choices=())

      def __init__(self, *args, **kwargs):
          super(UserForm, self).__init__(*args, **kwargs)
          self.fields['ut_id'].choices = models.UserType.objects.all().values_list('id', 'title')

2. 使用 ModelChoiceField 字段从另一张依赖表中获取数据

class UserType(models.Model):
  title = models.CharField(max_length=32)

 class UserForm(Form):
      ut_id = ModelChoiceField(queryset=models.UserType.objects.all())
```

43. Django 的 Model 中 ForeignKey 字段中的 on_delete 参数有什么作用？

```
指定级联操作：

models.CASCADE      ： 删除主表数据时，从表关联数据也会被删除
models.SET          ： 删除主表数据时，与之关联的值设置为指定值，设置：models.SET(值)，或者运行一个可执行对象（函数）。
models.SET_NULL     ： 删除主表数据时，从表关联数据的关联值设置为 NULL（前提 FK 字段需要设置为可空）
models.SET_DEFAULT  ： 删除主表数据时，从表与之关联的值设置为默认值（前提 FK 字段需要设置默认值）
models.DO_NOTHING   ： 删除主表数据时，如果从表中有与之关联的数据，引发错误 IntegrityError
models.PROTECT      ： 删除主表数据时，如果从表中有与之关联的数据，引发错误 ProtectedError
```

44. Django 中的 CSRF 实现机制？

```

```

45. Django 如何实现 websocket？

```

```

46. 基于 Django 使用 ajax 发送 POST 请求时，都可以使用那种方法携带 Token？

```

```

47. Django 中如何实现 ORM 表中添加数据时创建一条日志记录？

```

```

48. Django 的缓存如何设置？

```

```

49. Django 的缓存能用 Redis 嘛？如果可以的话，该怎么配置？

```

```

50. Django 路由系统中 name 的作用？

```

```

51. Django 模板中 filter 和 simple_tag 的区别？

```

```
