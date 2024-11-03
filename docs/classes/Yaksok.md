[**yaksok.ts**](../README.md) • **Docs**

***

[yaksok.ts](../globals.md) / Yaksok

# Class: Yaksok

## Implements

- `YaksokConfig`

## Constructors

### new Yaksok()

> **new Yaksok**(`files`, `config`): [`Yaksok`](Yaksok.md)

#### Parameters

• **files**: `Record`\<`string`, `string`\>

• **config**: `Partial`\<`YaksokConfig`\>

#### Returns

[`Yaksok`](Yaksok.md)

#### Defined in

[index.ts:116](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L116)

## Properties

### entryPoint

> **entryPoint**: `string`

#### Implementation of

`YaksokConfig.entryPoint`

#### Defined in

[index.ts:110](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L110)

***

### files

> **files**: `Record`\<`string`, `string`\>

#### Defined in

[index.ts:117](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L117)

***

### ran

> **ran**: `Record`\<`string`, `boolean`\> = `{}`

#### Defined in

[index.ts:114](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L114)

***

### runFFI()

> **runFFI**: (`runtime`, `code`, `args`) => `ValueTypes`

#### Parameters

• **runtime**: `string`

• **code**: `string`

• **args**: `Params`

#### Returns

`ValueTypes`

#### Implementation of

`YaksokConfig.runFFI`

#### Defined in

[index.ts:111](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L111)

***

### runners

> **runners**: `Record`\<`string`, [`CodeRunner`](CodeRunner.md)\> = `{}`

#### Defined in

[index.ts:113](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L113)

***

### stderr()

> **stderr**: (`message`) => `void`

#### Parameters

• **message**: `string`

#### Returns

`void`

#### Implementation of

`YaksokConfig.stderr`

#### Defined in

[index.ts:109](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L109)

***

### stdout()

> **stdout**: (`message`) => `void`

#### Parameters

• **message**: `string`

#### Returns

`void`

#### Implementation of

`YaksokConfig.stdout`

#### Defined in

[index.ts:108](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L108)

## Methods

### getRunner()

> **getRunner**(`fileName`): [`CodeRunner`](CodeRunner.md)

#### Parameters

• **fileName**: `string` = `...`

#### Returns

[`CodeRunner`](CodeRunner.md)

#### Defined in

[index.ts:126](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L126)

***

### run()

> **run**(`fileName`): [`CodeRunner`](CodeRunner.md)

#### Parameters

• **fileName**: `string` = `...`

#### Returns

[`CodeRunner`](CodeRunner.md)

#### Defined in

[index.ts:148](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L148)

***

### runOnce()

> **runOnce**(`fileName`): [`CodeRunner`](CodeRunner.md)

#### Parameters

• **fileName**: `string` = `...`

#### Returns

[`CodeRunner`](CodeRunner.md)

#### Defined in

[index.ts:156](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L156)
