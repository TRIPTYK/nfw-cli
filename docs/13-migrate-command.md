# migrate command

- Aliases : **mig** , **M**

## Arguments

### migrateName
- description : name of the migration file
- type : string

## Options

### restore
- description : restore sql data dump from file
- type : boolean
- default : false

## Basic Usage

Generate a migration file and executes it in src/migration folder

A migration generates a sql data dump each time in the same folder

```sh
    migrate <migrateName>
```

## Known problems
