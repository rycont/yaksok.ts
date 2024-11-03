[**yaksok.ts**](../README.md) • **Docs**

***

[yaksok.ts](../globals.md) / CodeRunner

# Class: CodeRunner

## Constructors

### new CodeRunner()

> **new CodeRunner**(`code`, `runtime`, `fileName`): [`CodeRunner`](CodeRunner.md)

#### Parameters

• **code**: `string`

• **runtime**: [`Yaksok`](Yaksok.md)

• **fileName**: `string`

#### Returns

[`CodeRunner`](CodeRunner.md)

#### Defined in

[index.ts:36](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L36)

## Properties

### ast

> **ast**: `Executable`

#### Defined in

[index.ts:33](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L33)

***

### exportedRules

> **exportedRules**: `Rule`[] = `[]`

#### Defined in

[index.ts:34](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L34)

***

### functionDeclaration

> **functionDeclaration**: `Node`[][] = `[]`

#### Defined in

[index.ts:31](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L31)

***

### scope

> **scope**: `Scope`

#### Defined in

[index.ts:32](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L32)

## Methods

### evaluateFromExtern()

> **evaluateFromExtern**(`node`): `ValueTypes`

#### Parameters

• **node**: `Evaluable`

#### Returns

`ValueTypes`

#### Defined in

[index.ts:83](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L83)

***

### run()

> **run**(): `void`

#### Returns

`void`

#### Defined in

[index.ts:65](https://github.com/rycont/yaksok.ts/blob/6985c53e247331ce96e0fffb5ef88585a28874c6/index.ts#L65)
