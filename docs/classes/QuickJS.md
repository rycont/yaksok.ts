[**yaksok.ts**](../README.md) • **Docs**

***

[yaksok.ts](../globals.md) / QuickJS

# Class: QuickJS

## Constructors

### new QuickJS()

> **new QuickJS**(`functions`): [`QuickJS`](QuickJS.md)

#### Parameters

• **functions**: `Record`\<`string`, (...`args`) => `any`\> = `{}`

#### Returns

[`QuickJS`](QuickJS.md)

#### Defined in

[bridge/quickjs/index.ts:19](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/bridge/quickjs/index.ts#L19)

## Properties

### instance

> **instance**: `any` = `null`

#### Defined in

[bridge/quickjs/index.ts:17](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/bridge/quickjs/index.ts#L17)

## Methods

### init()

> **init**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[bridge/quickjs/index.ts:23](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/bridge/quickjs/index.ts#L23)

***

### run()

> **run**(`bodyCode`, `args`): `ValueTypes`

#### Parameters

• **bodyCode**: `string`

• **args**: `Params`

#### Returns

`ValueTypes`

#### Defined in

[bridge/quickjs/index.ts:27](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/bridge/quickjs/index.ts#L27)
