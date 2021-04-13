# AddColumn
Add a column in the target entity
## Usage:
```sh
$ nfw add-column <entity> <property> <type>
```
## Alias(es):
adcol
## Options
### --default
- Description: Default value for the column
- Type: string
- Default: none
- Example:
```sh
$ nfw add-column <entity> <property> <type> --default <default>
```
### --length
- Description: Maximun length for the value
- Type: number
- Default: none
- Example:
```sh
$ nfw add-column <entity> <property> <type> --length <length>
```
### --width
- Description: Maximun width for the value
- Type: number
- Default: none
- Example:
```sh
$ nfw add-column <entity> <property> <type> --width <width>
```
### --isUnique
- Description: Value can be unique ?
- Type: boolean
- Default: false
- Example:
```sh
$ nfw add-column <entity> <property> <type> --isUnique 
```
### --isNullable
- Description: Value can be nullable ?
- Type: boolean
- Default: false
- Example:
```sh
$ nfw add-column <entity> <property> <type> --isNullable 
```
### --scale
- Description: Scale of the value
- Type: number
- Default: none
- Example:
```sh
$ nfw add-column <entity> <property> <type> --scale <scale>
```
### --precision
- Description: Precision of the value
- Type: number
- Default: none
- Example:
```sh
$ nfw add-column <entity> <property> <type> --precision <precision>
```
### --now
- Description: Set the date's default value to now
- Type: boolean
- Default: false
- Example:
```sh
$ nfw add-column <entity> <property> <type> --now 
```
### --enums
- Description: Set a enumeration for the column
- Type: enum
- Default: none
- Example:
```sh
$ nfw add-column <entity> <property> <type> --enums <enums>
```