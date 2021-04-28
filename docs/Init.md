# Init
Initiation of environment variables and the database.
## Usage:
```sh
$ nfw init
```
## Alias(es):
ini
## Options
### --noInitDb
- Description: Prohibits the connection to the MySQL server and the creation of the database and its tables.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw init --noInitDb 
```
### --seed
- Description: Populates database with some entries (only if noInitDb is false).
- Type: boolean
- Alias: -s
- Default: false
- Example:
```sh
$ nfw init --seed / -s 
```
### --docker
- Description: Creates a simple configurated MySQL docker container (only if noInitDb is false).
- Type: boolean
- Alias: -d
- Default: false
- Example:
```sh
$ nfw init --docker / -d 
```
### --yes
- Description: Keeps the default values for the DB configuration.
- Type: boolean
- Alias: -y
- Default: false
- Example:
```sh
$ nfw init --yes / -y 
```