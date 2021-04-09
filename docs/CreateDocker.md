# CreateDocker.md
Create a MySQL container.
## Usage:
```
docker <name>
```
## Alias(es):
dock
## Options
### --port
- Description: Listening port of the server.
- Type: number
- Default: 3306
### --user
- Description: Username of the created user.
- Type: string
- Default: user
### --password
- Description: Password of the user.
- Type: string
- Default: password
### --rootPassword
- Description: Password of root.
- Type: string
- Default: root
### --nativePassword
- Description: Set the default authentication plugin to mysql_native_password (useful for development purpose).
- Type: boolean
- Default: false
### --noRun
- Description: Only creates the container, without running it.
- Type: boolean
- Default: false