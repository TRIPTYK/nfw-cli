# AddColumn
Add a column in the target entity
## Usage:
```
nfw add-column <entity> <property> <type>
```
## Alias(es):
adcol
## Options
### --default
- Description: Default value for the column
- Type: string
- Default: none
### --length
- Description: Maximun length for the value
- Type: number
- Default: none
### --width
- Description: Maximun width for the value
- Type: number
- Default: none
### --isUnique
- Description: Value can be unique ?
- Type: boolean
- Default: false
### --isNullable
- Description: Value can be nullable ?
- Type: boolean
- Default: false
### --scale
- Description: Scale of the value
- Type: number
- Default: none
### --precision
- Description: Precision of the value
- Type: number
- Default: none
### --now
- Description: Set the date's default value to now
- Type: boolean
- Default: false
### --enums
- Description: Set a enumeration for the column
- Type: enum
- Default: none