# CreateDockerCommand
Create a MySQL container.
## Usage:
```
docker <name>
```
## Aliases:
dock.
## Options
### --port
- Description: Listening port of the server.
- Default: 3306
### --user
- Description: Username of the created user.
- Default: user
### --password
- Description: Password of the user.
- Default: password
### --rootPassword
- Description: Password of root.
- Default: root
### --nativePassword
- Description: Set the default authentication plugin to mysql_native_password (useful for development purpose).
- Default: empty
### --noRun
- Description: Only creates the container, without running it.
- Default: empty
