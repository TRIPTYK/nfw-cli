# New
Create a new project.
## Usage:
```sh
$ nfw new <name>
```
## Alias(es):
n
## Options
### --noConfigDb
- Description: Prohibit the configuration of the database infos.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <name> --noConfigDb 
```
### --seed
- Description: Populate database with some entries (only if noInitDb is false).
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <name> --seed 
```
### --docker
- Description: Create a simple configurated MySQL docker container (only if noConfigDb is false).
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <name> --docker 
```
### --path
- Description: Path where to clone the project.
- Type: string
- Default: none
- Example:
```sh
$ nfw new <name> --path <path>
```
### --branch
- Description: Get a version of the project from a specific branch.
- Type: string
- Default: master
- Example:
```sh
$ nfw new <name> --branch <branch>
```
### --yarn
- Description: Use yarn to fetch modules.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <name> --yarn 
```
### --noInit
- Description: Keep the default configuration and doesn't configure the database (Override noInitDb).
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <name> --noInit 
```