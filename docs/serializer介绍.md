# Serailzer

## 基本介绍

Serailizer 是 rest_framework 框架中的核心功能。

它主要针对模型表数据做操作，为模型表数据提供了序列化及反序列化的功能。

- 序列化：将模型类字段提取出来返回给前端，主要针对 GET 方法
- 反序列化：根据前端传递的数据对数据库记录进行删改，主要针对 POST、PUT、PATCH 方法

Serailizer 的使用非常简单，只需要创建一个序列器类并在视图中调用即可完成序列化和反序列化的所有需求。

## 序列器介绍

### BaseSerializer

BaseSerializer 是所有其它序列器的超类。

在通常情况下我们很少去使用它，因为实现它的各个功能比较麻烦。

### Serializer

Serailzer 是基于 BaseSerializer 的派生类实现。

使用它时我们需要自定义序列器字段，可扩展性较强。

### ModelSerializer

ModelSerializer 是基于 Serializer 的派生类实现。

是日常开发中最常用的 Serializer 之一，能够非常快捷的序列化出任何模型类数据。

### ListSerial

ListSerial 是基于 BaseSerializer 的派生类实现。

ListSerial 提供了一次性反序列化更新多个对象的行为。

Serailzer 和 ModelSerializer 本质上并不支持一次性更新反序列化多个对象，而 ListSerial 正是为了解决此种问题而诞生的。

### HyperlinkedModelSerializer

HyperlinkedIdentityField 是 ModelSerializer 的派生类实现。

它使用超链接来表示关系，而不是主键。

在特殊场景下会用到。

## 字段介绍

所有的序列器都可以自定义字段。常见的自定义字段有以下几类：

- 布尔字段
- 字符串字段
- 数值字段
- 时间字段
- 选项字段
- 文件上传字段
- 复合字段
- 其它字段

### 公用参数

每种自定义字段都具有一些公有的可指定参数，如下所示：

```
read_only：
    只读字段，反序列化时并不需要传入该字段，默认为 False

write_only：
    只写字段，序列化时并不会返回该字段，默认为 False

required：
    必写字段，反序列化时必须传入该字段，默认为 True

default：
    默认字段，反序列化时若未传入该字段，则采用此默认值

allow_null：
    允许为 None，反序列化时是否允许该字段传入 None，默认为 False

source：
    数据源获取，序列化时，该字段将采用的数据源是什么，可以返回一个模型类代理属性或其它字段，常用于序列化多表关系使用

validators：
    数据验证，反序列化时，该字段所采用的数据验证器是什么

error_messages：
    错误信息，一个包含错误信息和错误代码的字典

label：
    可用作 HTML 表单字段或其它描述性元素中字段名称的短文本字符串

help_text：
    可用作 HTML 表单字段或其他描述性元素中的字段描述的文本字符串

initial：
    应该用于预填充 HTML 表单字段的值的值。 您可以将一个可调用对象传递给它，就像你可以用任何普通的 Django Field

style：
    可用于控制渲染器应如何渲染字段的键值对字典
```

### 布尔字段

布尔字段有 2 个：

| 字段                                                                                         | 参数 | 描述                 |
| -------------------------------------------------------------------------------------------- | ---- | -------------------- |
| [BooleanField](https://www.django-rest-framework.org/api-guide/fields/#boolean-fields)       |      | 布尔字段             |
| [NullBooleanField](https://www.django-rest-framework.org/api-guide/fields/#nullbooleanfield) |      | 允许 None 的布尔字段 |

没有特别的参数说明。

### 字符串字段

字符串字段有 8 个：

| 字段                                                                                     | 参数                                                                                                | 描述         |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------ |
| [CharField](https://www.django-rest-framework.org/api-guide/fields/#charfield)           | max_length=None, min_length=None, allow_blank=False, trim_whitespace=True                           | 字符串字段   |
| [EmailField](https://www.django-rest-framework.org/api-guide/fields/#emailfield)         | max_length=None, min_length=None, allow_blank=False                                                 | 邮箱字段     |
| [RegexField](https://www.django-rest-framework.org/api-guide/fields/#regexfield)         | regex, max_length=None, min_length=None, allow_blank=False                                          | 正则字段     |
| [SlugField](https://www.django-rest-framework.org/api-guide/fields/#slugfield)           | max_length=50, min_length=None, allow_blank=False                                                   | 正则字段     |
| [URLField](https://www.django-rest-framework.org/api-guide/fields/#urlfield)             | max_length=200, min_length=None, allow_blank=False                                                  | url 字段     |
| [UUIDField](https://www.django-rest-framework.org/api-guide/fields/#uuidfield)           | format='hex_verbose'                                                                                | uuid 字段    |
| [FilePathField](https://www.django-rest-framework.org/api-guide/fields/#filepathfield)   | path, match=None, recursive=False, allow_files=True, allow_folders=False, required=None, \*\*kwargs | 文件路径字段 |
| [IPAddressField](https://www.django-rest-framework.org/api-guide/fields/#ipaddressfield) | protocol='both', unpack_ipv4=False, \*\*options                                                     | ip 地址字段  |

参数说明：

```
max_length: 最大长度
min_length: 最小长度
allow_blank: 是否允许为空字符串作为有效值
allow_null: 是否允许 None 作为有效值
trim_whitespace: 是否修剪两侧空白


path: 文件存储的结对路径
match: 用于过滤文件名的正则表达式
recursive: 是否包括路径所有子目录
allow_files: 是否包含指定位置的文件
allow_folders: 是否包含制定位置的文件夹

protocol: 协议，IPv4 或 IPv6
unpack_ipv4: 解压 IPv4 映射地址
```

### 数值字段

数值字段有 3 个：

| 字段                                                                                 | 参数                                                                              | 描述       |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------- |
| [IntegerField](https://www.django-rest-framework.org/api-guide/fields/#integerfield) | max_value=None, min_value=None                                                    | 整数字段   |
| [FloatField](https://www.django-rest-framework.org/api-guide/fields/#floatfield)     | max_value=None, min_value=None                                                    | 浮点数字段 |
| [DecimalField](https://www.django-rest-framework.org/api-guide/fields/#decimalfield) | max_digits, decimal_places, coerce_to_string=None, max_value=None, min_value=None | 十进制字段 |

参数说明：

```
max_value: 最大值
min_value: 最小值
max_digits: 小数点前最大位数
decimal_places: 小数点后位数
coerce_to_string: 是否返回 string 类型
```

### 时间字段

时间字段有 3 个：

| 字段                                                                                   | 参数                                                                           | 描述         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------ |
| [DateTimeField](https://www.django-rest-framework.org/api-guide/fields/#datetimefield) | format=api_settings.DATETIME_FORMAT, input_formats=None, default_timezone=None | 日期时间字段 |
| [DateField](https://www.django-rest-framework.org/api-guide/fields/#datefield)         | format=api_settings.DATE_FORMAT, input_formats=None                            | 日期字段     |
| [TimeField](https://www.django-rest-framework.org/api-guide/fields/#timefield)         | format=api_settings.TIME_FORMAT, input_formats=None                            | 时间字段     |

参数说明：

```
format: 输出格式字符串，默认是 iso-8601 格式（序列化）
input_formats: 解析字符串时间的格式，默认是 iso-8601 格式（反序列化）
default_timezone: 时区，如已启用 USE_TZ 且未设置该值，默认则为当前时区

max_value: 时间持续的最大值
min_value: 时间持续的最小值
```

### 选项字段

选项字段有 2 个：

| 字段                                                                                               | 参数    | 描述     |
| -------------------------------------------------------------------------------------------------- | ------- | -------- |
| [ChoiceField](https://www.django-rest-framework.org/api-guide/fields/#choicefield)                 | choices | 单选字段 |
| [MultipleChoiceField](https://www.django-rest-framework.org/api-guide/fields/#multiplechoicefield) | choices | 多选字段 |

参数说明：

```
choices: 有效值列表，或 (key, display_name) 元组
html_cutoff: HTML 选择下拉菜单显示的最大条目数，默认为 None
```

### 文件上传字段

文件上传字段有 2 个：

| 字段                                                                             | 参数                                                                    | 描述     |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- |
| [FileField](https://www.django-rest-framework.org/api-guide/fields/#filefield)   | max_length=None, allow_empty_file=False, use_url=UPLOADED_FILES_USE_URL | 文件字段 |
| [ImageField](https://www.django-rest-framework.org/api-guide/fields/#imagefield) | max_length=None, allow_empty_file=False, use_url=UPLOADED_FILES_USE_URL | 图像字段 |

参数说明：

```
max_length: 指定文件名最大长度
allow_empty_file: 指定是否允许空文件
use_url: 如果设置为 True 将 URL 字符串值表示输出，否则将以文件名字符串值表示输出，默认值为 True
```

### 复合字段

复合字段有 4 个：

| 字段                                                                               | 参数                                                                               | 描述             |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| [ListField](https://www.django-rest-framework.org/api-guide/fields/#listfield)     | child=&lt;A_FIELD_INSTANCE&gt;, allow_empty=True, min_length=None, max_length=None | 列表字段         |
| [DictField](https://www.django-rest-framework.org/api-guide/fields/#dictfield)     | child=&lt;A_FIELD_INSTANCE&gt;, allow_empty=True                                   | 字典字段         |
| [HStoreField](https://www.django-rest-framework.org/api-guide/fields/#hstorefield) | child=&lt;A_FIELD_INSTANCE&gt;, allow_empty=True                                   | 预配置的字典字段 |
| [JSONField](https://www.django-rest-framework.org/api-guide/fields/#jsonfield)     | binary, encoder                                                                    | JSON 字段        |

参数说明：

```
child: 用于验证列表/字典中对象的字段实例，如果未提供该参数，则不会验证列表中的字段
allow_empty: 是否允许为空列表/字典
min_length: 列表的最小长度
max_length: 列表的最大长度

binary: 若为 True 则该字段将输出并验证 JSON 编码的字符串，默认为 False
encoder: 使用此 JSON 编码器序列化输入对象，默认为 None
```

### 其它字段

其它字段有 4 个：

| 字段                                                                                                   | 参数                                           | 描述               |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------ |
| [ReadOnlyField](https://www.django-rest-framework.org/api-guide/fields/#readonlyfield)                 |                                                | 只读字段           |
| [HiddenField](https://www.django-rest-framework.org/api-guide/fields/#hiddenfield)                     |                                                | 隐藏（默认值）字段 |
| [ModelField](https://www.django-rest-framework.org/api-guide/fields/#modelfield)                       | model_field=&lt;Django ModelField instance&gt; | 模型字段           |
| [SerializerMethodField](https://www.django-rest-framework.org/api-guide/fields/#serializermethodfield) | method_name=None                               | 序列器方法字段     |

参数说明：

```
- model_field: 模型类的一个字段
- method_name: 要调用的序列化程序上方法的名称，如果不指定，默认调用 get_filedname
```
