[**yaksok.ts**](../README.md) • **Docs**

***

[yaksok.ts](../globals.md) / Tokenizer

# Class: Tokenizer

## Constructors

### new Tokenizer()

> **new Tokenizer**(`code`): [`Tokenizer`](Tokenizer.md)

#### Parameters

• **code**: `string`

#### Returns

[`Tokenizer`](Tokenizer.md)

#### Defined in

[prepare/tokenize/index.ts:51](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L51)

## Properties

### chars

> **chars**: `string`[]

#### Defined in

[prepare/tokenize/index.ts:29](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L29)

***

### column

> **column**: `number` = `0`

#### Defined in

[prepare/tokenize/index.ts:32](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L32)

***

### ffiHeaders

> **ffiHeaders**: `Node`[][] = `undefined`

#### Defined in

[prepare/tokenize/index.ts:26](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L26)

***

### functionHeaders

> **functionHeaders**: `Node`[][] = `undefined`

#### Defined in

[prepare/tokenize/index.ts:25](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L25)

***

### line

> **line**: `number` = `0`

#### Defined in

[prepare/tokenize/index.ts:31](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L31)

***

### tokens

> **tokens**: `Node`[] = `[]`

#### Defined in

[prepare/tokenize/index.ts:28](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L28)

***

### EXPRESSIONS

> `static` **EXPRESSIONS**: `string`[]

#### Defined in

[prepare/tokenize/index.ts:49](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L49)

***

### OPERATORS

> `static` **OPERATORS**: `string`[]

#### Defined in

[prepare/tokenize/index.ts:34](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L34)

## Accessors

### position

#### Get Signature

> **get** **position**(): `Position`

##### Returns

`Position`

#### Defined in

[prepare/tokenize/index.ts:317](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L317)

## Methods

### canBeFisrtCharOfNumber()

> **canBeFisrtCharOfNumber**(`char`): `boolean`

#### Parameters

• **char**: `string`

#### Returns

`boolean`

#### Defined in

[prepare/tokenize/index.ts:134](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L134)

***

### comment()

> **comment**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:178](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L178)

***

### EOL()

> **EOL**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:205](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L205)

***

### expression()

> **expression**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:275](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L275)

***

### ffi()

> **ffi**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:153](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L153)

***

### identifier()

> **identifier**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:246](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L246)

***

### indent()

> **indent**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:184](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L184)

***

### isFFI()

> **isFFI**(): `boolean`

#### Returns

`boolean`

#### Defined in

[prepare/tokenize/index.ts:121](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L121)

***

### isNumeric()

> **isNumeric**(`char`): `boolean`

#### Parameters

• **char**: `string`

#### Returns

`boolean`

#### Defined in

[prepare/tokenize/index.ts:130](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L130)

***

### number()

> **number**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:211](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L211)

***

### operator()

> **operator**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:256](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L256)

***

### postprocess()

> **postprocess**(): `Node`[]

#### Returns

`Node`[]

#### Defined in

[prepare/tokenize/index.ts:285](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L285)

***

### preprocess()

> **preprocess**(`code`): `string`[]

#### Parameters

• **code**: `string`

#### Returns

`string`[]

#### Defined in

[prepare/tokenize/index.ts:280](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L280)

***

### shift()

> **shift**(): `string`

#### Returns

`string`

#### Defined in

[prepare/tokenize/index.ts:295](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L295)

***

### string()

> **string**(`openingChar`): `void`

#### Parameters

• **openingChar**: `string`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:232](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L232)

***

### tokenize()

> **tokenize**(): `void`

#### Returns

`void`

#### Defined in

[prepare/tokenize/index.ts:57](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/prepare/tokenize/index.ts#L57)
