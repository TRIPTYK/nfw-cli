# Node FrameWork

This repository contains a CLI based app that generate a NodeJs API base on [3rd_party_ts_boilerplate](https://github.com/AmauryD/3rd-party-ts-boilerplate)

Commands :

* [nfw new](#New)
* [nfw test](#Test)
* [nfw generate](#generate)
* [nfw import](#import)
* [nfw delete](#delete)
* [nfw info](#info)
* [nfw start](#start)
* [nfw migrate](#migrate)
* [nfw createSU](#createSu)
* [nfw addRelation](#addRelation)
* [nfw removerelation](#removeRelation)
* [nfw editModel](#editModel)

# New

Command :

 ```bash
 $ nfw new <appName> --[Options]
 ```
##### Alias

    $ nfw n

##### Parameters

* **_Application name_** - Required ! Type: string
* **_Option_** - Optionnal ! See details below

#### Description

Generate a new project.

![](readme/nfwNew.gif)
### Option

* --env

Usage

```bash
$ nfw new --env
```
#### Description

Generate a new project asking for environement variables such as :

* Environement      ("Development"/"Production"/"Staging"/"Test")
* Port              (Ex : 8000)
* Database Host     (Ex : localhost or your-domain.org)
* Database name     (Ex : 3rd+party+ts+boilerplate)
* Database Username (Ex : root or User1)
* Database Passord  (Hidden by default)
* Database port     (ex : 3306)

![](readme/nfwNewEnv.gif)

### Option

* --path

Usage

```bash
$ nfw new --path
```
#### Description

Generate a new project asking for a path :


![](readme/nfwNewPath.gif)

### Option

* --Docker

Usage

```bash
$ nfw new --Docker
```
#### Description

Generate a new project asking for dockerfile and environement variables such as :

* Container Port        (Ex : 3306)
* Container/image name  (Ex : 8000)
* Docker mysql name     (Ex : 3rd_party_ts_boilerplate)
* Root Password         (Ex : root)
* Environement          ("Development"/"Production"/"Staging"/"Test")
* Port                  (Ex : 8000)
* Database Host         (Ex : localhost or your-domain.org)
* Database name         (Ex : 3rd_party_ts_boilerplate)
* Database Username     (Ex : root or User1)
* Database Passord      (Hidden by default)
* Database port         (ex : 3306)
* Path validation 
    * New path 
* Project Name      (Ex: my_new_project)

![](readme/nfwNewDocker.gif)
### Option

* --yarn

Usage

```bash
$ nfw new --yarn
```
#### Description

Use Yarn instead of npm

# Test 

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw test
 ```

##### Alias

    $ nfw t

#### Description

Compile TypeScript and execute unit tests

![](readme/nfwTestFail.gif)
![](readme/nfwTestPass.gif)
### Option

* --logs

Usage

```bash
$ nfw test --logs
```
#### Description

Compile TypeScript and execute unit test with full output.

![](readme/nfwTestPassLogs.gif)
![](readme/nfwTestFailLogs.gif)

# Generate

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw generate <modelName> [CRUD]
 ```
##### Aliases

    $ nfw g <modelName> [CRUD]
    $ nfw gen <modelName> [CRUD]

##### Parameters

* **_modelName_** - Required ! Type: string
* **_CRUD_** - Optionnal ! Type: string with C, R, U, D letter only
    * Specify the generate function which part of the CRUD it must generate.
#### Description

Generate a model, a controller, a serializer, ... Ready to use with the API.
Then generate a MySQL migration and execute it.

![](readme/nfwGenerate.gif)

# Import

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw import
 ```
##### Aliases

    $ nfw imp

#### Description

Generate model base on the tables existing in the database. **WARNING**: It will ovveride existing models with the same name !

![](readme/import.gif)

# Delete

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw delete <modelName> --[Option]
 ```
##### Aliases

    $ nfw D <modelName>
    $ nfw del <modelName>

##### Parameters

* **_modelName_** - Required ! Type: string
* **_Option_** - Optionnal ! See details below

#### Description

Delete a generated model with all the related files. Drop the related table and execute a SQLDump.

![](readme/nfwDelete.gif)

### Option

* --DROP

Usage

```bash
$ nfw new --DROP
```
#### Description

Delete the model and all the related files then drop the related table in the database :


![](readme/nfwDeleteDrop.gif)

# Info

Command :

 ```bash
 $ nfw info
 ```
#### Description

Show informaion about who developed the software.

![](readme/nfwInfo.gif)

# Start

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw start
 ```

#### Description

Compile TypeScript then start the API.

![](readme/nfwStart.gif)

### Options

* --env

Usage

```bash
$ nfw start --env=<Environement>
```
##### Parameter

* **_Environement_** - Required ! Type: string *["Development","Production","Staging","Test"]*
    
#### Description

Compile TypeScript and execute unit test with full output.

![](readme/nfwStartEnv.gif)


# Migrate

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw migrate
 ```

#### Description

Compile TypeScript, generate a TypeORM migration, recomplie, then execute the migration script.

![](readme/nfwMigrate.gif)

# CreateSu

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw migrate
 ```

#### Description

Compile TypeScript, generate a TypeORM migration, recomplie, then execute the migration script.

![](readme/nfwMigrate.gif)

# Commands options

## Option:

* --version

### Description

Show the current version

## Option

* --help or -h

### Description

Show help for every commands or a specified command

Exemple *(general)*

![](readme/nfwHelp.gif)

Exemple *(for a specific command)*

![](readme/nfwCommandHelp.gif)

# addRelation 

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw addR <relation> <model1> <model2>
 ```
##### Parameters

* **_relation_** - Required ! Type: string
    * -oto (OneToOne) model1 will be the one with the foreignkey in the database
    * -mto (ManyToOne) many model1 to one model 2
    * -otm (OnetoMany) one model1 to many model2
    * -mtm (ManyToMany) 
* **_model1_** - Required !
    * name of one your existing model
* **_model2_** - Required !
    * name of one your existing model 

##### Alias

    $ nfw addR
    $ nfw ar

#### Description

Create a reliationship between two model and write relation in the serializer and the controller

### Option

* --name
* --refCol

Usage

```bash
$ nfw addR oto model1 model2  
```
#### Description
* --name let you choose the name of the foreignKey for a OneToOne relationship or the name of the bridgind table for a many to many relationship
* --refCol let you choose the column referenced in the foreign key for a one to one reliationship. it only works with unique or primary column


# removeRelation 

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw rmRl <model1> <model2>
 ```

##### Alias

    $ nfw rmRl
    $ nfw rr

#### Description

    remove a relationship between two models

##### Parameters
 
* **_model1_** - Required !
    * name of one your existing model
* **_model2_** - Required !
    * name of one your existing model 

Usage

```bash
$ nfw rmRL  
```

# editModel

**You have to be in the project directory to execute this command !**

Command :

 ```bash
 $ nfw em <modelName> <action> [columnName]
 ```

##### Alias

    $ nfw em
    $ nfw edit

#### Description

    let you either add or remove a column in an existing model 

##### Parameters
 
* **_modelName_** - Required !
    * name of one your existing model
* **_action_** - Required !
    * either add or remove. 
* **_action_** - Required only if action is remove
    * name of the column you want to remove
Usage

```bash
$ nfw edit model1 add 
```

```bash
$ nfw edit model1 remove column1 
```


