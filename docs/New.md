# New
Creates a new project.
## Usage:
```sh
$ nfw new <path>
```
## Alias(es):
n
## Options
### --noConfigDb
- Description: Prohibits the configuration of the database infos.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw new <path> --noConfigDb 
```
### --seed
- Description: Populates database with some entries (only if noConfigDb is false).
- Type: boolean
- Alias: -s
- Default: false
- Example:
```sh
$ nfw new <path> --seed / -s 
```
### --docker
- Description: Creates a simple configurated MySQL docker container (only if noConfigDb is false).
- Type: boolean
- Alias: -d
- Default: false
- Example:
```sh
$ nfw new <path> --docker / -d 
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
- Description: Keeps the default configuration and doesn't configure the database (Override noConfigDb).
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