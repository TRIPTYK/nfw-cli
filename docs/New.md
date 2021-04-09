# NewCommand
Create a new project.
## Usage:
```
new <name>
```
## Alias(es):
n
## Options
### --noInitDb
- Description: Prohibit the initiation of the database.
- Type: boolean
- Default: false
### --docker
- Description: Create a simple configurated MySQL docker container.
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
- Description: Keep the default configuration and doesn't configure the database.
- Type: boolean
- Default: false