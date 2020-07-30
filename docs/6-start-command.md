# createSU command

- Aliases : none

## Arguments

- none

## Options

### env 
- description : "Specify the environment type"
- type : string
- default : development

### monitoring 
- description : "Starts with the monitoring server of the API"
- type : boolean
- default : false

## Basic Usage

Starts the server

```sh
    nfw start
```

## Known problems
- Database can take some time to connect , sometimes you need to run the command again because of time out
*