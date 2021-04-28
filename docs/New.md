# New
Creates a new project.
## Usage:
```sh
$ nfw new <path>
```
## Alias(es):
n
## Options
### --noInitDb
- Description: Prohibits the connection to the MySQL server and the creation of the database and its tables.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <path> --noInitDb 
```
### --seed
- Description: Populates database with some entries (only if noInitDb is false).
- Type: boolean
- Alias: -s
- Default: false
- Example:
```sh
$ nfw new <path> --seed / -s 
```
### --docker
- Description: Creates a simple configurated MySQL docker container (only if noInitDb is false).
- Type: boolean
- Alias: -d
- Default: false
- Example:
```sh
$ nfw new <path> --docker / -d 
```
### --yes
- Description: Keeps the default values for the DB configuration.
- Type: boolean
- Alias: -y
- Default: false
- Example:
```sh
$ nfw new <path> --yes / -y 
```
### --branch
- Description: Gets a version of the project from a specific version/branch/commit hash.
- Type: string
- Alias: -b
- Default: master
- Example:
```sh
$ nfw new <path> --branch / -b <value for branch>
```
### --yarn
- Description: Uses yarn to fetch modules.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <path> --yarn 
```
### --noInit
- Description: Keeps the default configuration and doesn't init the database (Override noInitDb and yes).
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <path> --noInit 
```
### --force
- Description: Forces the cloning of the repo.
- Type: boolean
- Alias: -f
- Default: false
- Example:
```sh
$ nfw new <path> --force / -f 
```