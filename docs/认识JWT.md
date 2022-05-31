# 认识 JWT

## JWT 简介

JWT 全称是 JSON WEB TOKEN，这是一种为了在网络应用环境之间传递声明而执行的一种基于 JSON 的开发标准（RFC 7519），特别适用于分布式站点的单点登录（SSO）场景。

JWT 的声明方式一般被用于在身份提供者和服务提供者之间传递被认证的用户身份信息，以便于从资源服务器中获取资源。

在身份信息传递时，JWT 可以添加一些额外的声明信息，该 TOKEN 也可直接被用于认证、也可用于加密。

## JWT 构成

### 基本构成

JWT 本质就是 TOKEN，它由 3 部分组成，分别为：

- 头部：header
- 荷载：payload
- 主体部分以及签证部分：signature

其中，header 和 payload 由 base64 进行编码（可反解的加密），而 signature 部分则是由 header + payload + secret 组成，通过非对称加密技术进行加密，是不可反解的。

JWT 中的各部分之间用 . 分割符进行区分，如下所示：

```
eyJ0eXBlIjogIkpXVCIsICJhbGciOiAiSEFTSDI1NiJ9.eyJpZCI6IDEwMDEsICJuYW1lIjogImFza2ZpeSIsICJhZ2UiOiAxOH0=.fa9a45ffd9afe770dfa83b2dc0504bc5cfb7b8d8e2b30c4c74ed5f35e82455ac
```

### header

JWT 中的 header（头部） 部分一般存储 2 种信息：

- 声明类型：通常是 JWT
- 声明 signature 所使用的加密算法，通常是 SHA256

下面进行自定义头部信息：

```
{
    "type": "JWT",
    "alg": "HASH256"
}
```

然后使用 base64 对其进行编码，最终得到的结果是：

```
eyJ0eXBlIjogIkpXVCIsICJhbGciOiAiSEFTSDI1NiJ9
```

除此之外，你也可以在 header 中添加一些额外的信息，如公司名称等等，这都是允许的。

### payload

JWT 中的 payload（荷载） 作为 JWT 三部分中的第二部分，可以存储一些有效信息，如下是常见的 3 种有效信息：

- 标准中的注册声明（建议添加、但不强制）
- 公共声明
- 私有声明

标准中的注册声明 key 与说明：

```
iss：JWT 签发者（服务端）
lat：JWT 签发时间
sub：JWT 所面向的用户
aud：接收 JWT 的一方
exp：JWT 的过期时间，该时间必须大于签发时间
nbf：在某一个时间段后，该 JWT 将不可用
jti：JWT 的唯一身份表示，主要用作一次性 TOKEN、避免时序攻击
```

公共的声明：

```
公共的声明可以添加任何有效信息，一般添加用户相关信息或其它业务所需的必要信息。

但不建议添加敏感信息，因为 payload 部分在客户端中可以通过 base64 反解密出来
```

私有的声明：

```
私有声明是提供者和消费者所共同定义的协议，一般不建议存放敏感信息，因为 base64 是对称解密的，这意味着该部分信息可以归类未明文信息
```

下面定义荷载信息：

```
{
    "id": "1001",
    "name": "askfiy",
    "age": "18"
}
```

然后使用 base64 对其进行编码，最终得到的结果是：

```
eyJpZCI6IDEwMDEsICJuYW1lIjogImFza2ZpeSIsICJhZ2UiOiAxOH0=
```

### signature

JWT 中的 signature（签证）作为 JWT 三部分中的第三部分，其由 header + payload + secret 组成。

它本身不存储任何信息，只是在做认证校验时使用。

它的生产流程如下：

```
1. 将 base64 加密后的 header 信息保存
2. 将 base64 加密后的 payload 信息保存
3. 将 header 信息和 payload 信息通过 . 进行连接，得到一个字符串并保存
4. 通过 header 中声明的加密方式进行加盐（secret）组合加密，就构成了 JWT 中的第三方部分
```

下面将上面生成的 header + payload 信息通过 . 连接，并指定一个 secret 得到 signature 信息：

```
import hashlib

header = "eyJ0eXBlIjogIkpXVCIsICJhbGciOiAiSEFTSDI1NiJ9"
payload = "eyJpZCI6IDEwMDEsICJuYW1lIjogImFza2ZpeSIsICJhZ2UiOiAxOH0="
secret = bytes("secret".encode("utf-8"))

header_payload = bytes((header + "." + payload).encode("utf-8"))

signature = hashlib.sha256(header_payload + secret).hexdigest()  # 这里的加密方式应该从 header 中获取，而不是直接指定

print(signature)

# fa9a45ffd9afe770dfa83b2dc0504bc5cfb7b8d8e2b30c4c74ed5f35e82455ac
```

## Python 演示

下面将使用 Python 演示如何创建一个 JWT：

```
import json
import base64
import hashlib

secret = b"secret"

header = {
    "type": "JWT",
    "alg": "HASH256"
}

jwt_header = base64.b64encode(
    json.dumps(
        header
    ).encode("utf-8")
)


payload = {
    "id": 1001,
    "name": "askfiy",
    "age": 18
}
jwt_payload = base64.b64encode(
    json.dumps(
        payload
    ).encode("utf-8")
)


jwt_header_payload = bytes(jwt_header + b'.' + jwt_payload)


if header.get("alg") == "HASH256":
    jwt_signature = hashlib.sha256(
        jwt_header_payload + secret).hexdigest().encode("utf-8")
    jwt = bytes(jwt_header_payload + b'.' + jwt_signature)
    print(jwt)

else:
    raise Exception("don't support this algorithm")
```

最终结果：

```
b'eyJ0eXBlIjogIkpXVCIsICJhbGciOiAiSEFTSDI1NiJ9.eyJpZCI6IDEwMDEsICJuYW1lIjogImFza2ZpeSIsICJhZ2UiOiAxOH0=.fa9a45ffd9afe770dfa83b2dc0504bc5cfb7b8d8e2b30c4c74ed5f35e82455ac'
```

## JWT 验证

下面是 JWT 的验证流程图：

```
 ┌────────────┐                                                       ┌──────────────────────────────────────────┐
 │            ├───────────────────────►登录──────────────────────────►│                                          │
 │            │                                                       │               查询数据库                 │
 │            │                                                       │              保存用户数据                │
 │            │                                                       │              加盐生成 JWT                │
 │            │◄─────────────────────返回 JWT◄────────────────────────│                                          │
 │            │                                                       │                                          │
 │            │                                                       ├──────────────────────────────────────────┤
 │            │                                                       │                                          │
 │            │                                                       │                                          │
 │   client   │                                                       │     base64 解密 JWT 第二段 payload 信息  │
 │            │                                                       │           并查询是否存在该用户           │
 │            │                                                       │        若不存在该用户则返回错误          │
 │            │─────────────────────►再次访问────────────────────────►│       若存在该用户则判断是否过期         │
 │            │                                                       │  若未过期则将 JWT header 和 JWT payload  │
 │            │                                                       │       进行加盐加密并得到一个结果         │
 │            │                     返回错误                          │  将该结果与 JWT 的 signature 进行对比    │
 │            │◄─────────────或者验证成功后请求资源◄──────────────────│          如果成功则校验通过              │
 │            │                                                       │          如果失败则校验错误              │
 │            │                                                       │                                          │
 └────────────┘                                                       └──────────────────────────────────────────┘
```

下面是原生 TOKEN 的验证流程图：

```
               ┌─────────────────────────► 第一次访问并登录─────────────────────────────┐
               │                                                                        ▼
 ┌─────────────┴┐                      ┌─────────┬──────────┐                     ┌──────────┐
 │ 客户端浏览器 │◄──────────────────── │加密信息 │未加密信息│◄────── 返回◄────────│  服务器  │
 └─────────────┬┘                      └─────────┴──────────┘                     └──────────┘
        ▲      │                                                                        ▲  │
        │      └───────────────► 第二次访问会带上加密信息和未加密信息───────────────────┘  │
        │                                                                                  │
        │                               ┌─────────┬──────────┐                             │
        │                               │加密信息 │未加密信息│◄───────进行处理 ◄───────────┘
        │                               └─────────┼──────────┘
        │                                         │
        │                                         ▼
        │                                        拆分
        │                                         │
        │                                         ▼
        │                                    ┌──────────┐     ┌──────────────┐
        │                                    │未加密信息│     │原本的加密信息│───────┐
        │                                    └────┬─────┘     └──────────────┘       │
        │                                         │                  ▲               │
       成功                                       ▼                  │               │
     返回页面                                  进行加密              │               │
     及免登陆                                     │                  │  成功后拿未加密信息返回页面
        ▲                                         │                  │          以及免登陆
        │                                         ▼                  │               │
        │                                   ┌────────────┐           │               │
        │                                   │新的加密信息│───────────┘               │
        │                                   └────────────┘                           │
        │                                                                            │
        └────────────────────────────────────────────────────────────────────────────┘
```

## JWT 优势

要想了解 JWT 的优势，则需要让其与 cokkie 以及 session 做对比。

1）cookie 的劣势：

```
- 数据存放在本地，可能会被盗取，这样会产生伪造登录的情况发生
```

2）session 的劣势：

```
- 数据存放服务器，占用服务器资源
- 用户每次登录成功后，都需要向数据库写入 session，速度缓慢
- 对于集群式部署，如果存储 session 的数据库不一致，则会是个大麻烦，用户如果接入了不同的服务器，则意味着写入的 session 也会在不同的服务器中，
这会导致用户的 session 在不同数据库中会造成多次写入的问题
```

3）jwt 的优势：

```
- 数据存放在本地，不占用服务器资源，但必须要要和服务器存储的 secret 进行一致性对比后才能验证成功
- 没有向数据库写入的操作
- 集群式部署也没有问题，前提是每个服务器的 secret 都一样
```
