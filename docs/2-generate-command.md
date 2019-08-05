# Generate command

- Aliases : **gen**  , **g**

## Arguments

### modelName
- description : Name of the entity to generate
- type : string

## Options

### CRUD
- description : combination of letters meaning **C**reate , **R**ead , **U**pdate or **D**elete
- type : string
- default : CRUD

### part
- description : generate only one component of the entity , available values are : "model","validation","serializer","controller","relation","repository","middleware"
- type : string
- default : null


## Basic Usage

To generate an entity run

```sh
 nfw generate <modelName>
 ```

### Entity generation choice

The console will prompt you 3 different options to choose from :

-  Create an entity : will create an entity with a prompt asking column names and values
-  Create an empty entity : will create an entity without any column
- Nothing : exit app

![alt text](../github/1-env.PNG)

## Known problems

--
