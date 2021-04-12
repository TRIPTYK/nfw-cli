# Init
Initiation of environment variables and the database.
## Usage:
```
nfw init
```
## Alias(es):
ini
## Options
### --noConfigDb
- Description: Prohibit the configuration of the database infos.
- Type: boolean
- Default: false
### --seed
- Description: Populate database with some entries (only if noInitDb is false).
- Type: boolean
- Default: false
### --docker
- Description: Create a simple configurated MySQL docker container (only if noConfigDb is false).
- Type: boolean
- Default: false