# addUserToAllAgentClasses

This script is designed to add a user to all agent classes in the database as both a user and an admin. It utilizes Sequelize models to interact with the database and perform the necessary operations.

## Function

### addUserToAllAgentClasses

This asynchronous function takes a user's email as input and adds the user to all agent classes as both a user and an admin.

#### Parameters

- `userEmail: string` - The email of the user to be added to all agent classes.

#### Description

1. **Initialize Models**: The function begins by initializing the database models using `initializeModels()`.
2. **Fetch Agent Classes**: It retrieves all agent classes from the database using `PsAgentClass.findAll()`.
3. **Check for Agent Classes**: If no agent classes are found, it logs an error message and exits.
4. **Find User**: The function searches for the user in the database using the provided email with `User.findOne()`.
5. **Check for User**: If the user is not found, it logs an error message and exits.
6. **Add User to Agent Classes**: For each agent class:
   - It checks if the user already has user access using `agentClass.hasUser(user)`. If not, it adds the user as a user using `agentClass.addUser(user)`.
   - It checks if the user already has admin access using `agentClass.hasAdmin(user)`. If not, it adds the user as an admin using `agentClass.addAdmin(user)`.
7. **Error Handling**: Any errors encountered during the process are logged to the console.
8. **Close Connection**: Finally, the database connection is closed using `sequelize.close()`.

## Example Usage

To run the script, use the following command in the terminal:

```bash
ts-node addUserToAllAgentClasses.ts <userEmail>
```

Replace `<userEmail>` with the email of the user you wish to add to all agent classes.

## Dependencies

- **Sequelize**: Used for database interactions.
- **PsAgentClass**: Model representing agent classes in the database.
- **User**: Model representing users in the database.
- **initializeModels**: Function to initialize database models.
- **sequelize**: Sequelize instance for managing the database connection.

## File Path

The full path to this file is `@policysynth/agents/tools/addUserToAllAgentClasses.js`.