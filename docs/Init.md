# Init
Initiation of environment variables and the database.
## Usage:
```sh
$ nfw init
```
## Alias(es):
ini
## Options
### --noConfigDb
- Description: Prohibit the configuration of the database infos.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw init --noConfigDb 
```
### --seed
- Description: Populate database with some entries (only if noConfigDb is false).
- Type: boolean
- Default: false
- Example:
```sh
$ nfw init --seed 
```
### --docker
- Description: Create a simple configurated MySQL docker container (only if noConfigDb is false).
- Type: boolean
- Default: false
- Example:
```sh
$ nfw init --docker 
```