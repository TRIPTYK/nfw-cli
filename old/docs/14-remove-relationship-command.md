# removeRelation command

- Aliases : **rr** **rmRl**

## Arguments

### relation
- description : Name of the relation , can be 'mtm','mto','otm','oto'
- type : string

### model1
- description : Name of the left model
- type : string

### model2
- description : Name of the right model
- type : string

## Basic Usage

Remove a relation of specific type between 2 models

```sh
    nfw removeRelation <relation> <model1> <model2>
```

## Known problems

--