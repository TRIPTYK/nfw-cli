# New
Create a new project.
## Usage:
```
nfw new <name>
```
## Alias(es):
n
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
### --path
- Description: Path where to clone the project.
- Type: string
- Default: none
### --branch
- Description: Get a version of the project from a specific branch.
- Type: string
- Default: master
### --yarn
- Description: Use yarn to fetch modules.
- Type: boolean
- Default: false
### --noInit
- Description: Keep the default configuration and doesn't configure the database (Override noInitDb).
- Type: boolean
- Default: false